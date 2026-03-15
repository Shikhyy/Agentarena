# AgentArena Infrastructure — Terraform

terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "firestore.googleapis.com",
    "pubsub.googleapis.com",
    "redis.googleapis.com",
    "aiplatform.googleapis.com",
    "storage.googleapis.com",
    "cloudscheduler.googleapis.com",
    "secretmanager.googleapis.com",
  ])
  service = each.value
}

# ── Pub/Sub Topics (per match type) ─────────────────────────

resource "google_pubsub_topic" "game_events" {
  name = "game-events"
}

resource "google_pubsub_topic" "commentary" {
  name = "commentary"
}

resource "google_pubsub_topic" "odds" {
  name = "odds-updates"
}

resource "google_pubsub_topic" "negotiation" {
  name = "negotiation"
}

resource "google_pubsub_topic" "judge" {
  name = "judge-events"
}

resource "google_pubsub_topic" "transactions" {
  name = "transaction-events"
}

# ── Redis (Memorystore) ─────────────────────────────────────

resource "google_redis_instance" "arena_cache" {
  name           = "arena-cache"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.region

  redis_version = "REDIS_7_0"
  display_name  = "AgentArena Cache"

  labels = {
    app = "agentarena"
  }
}

# ── Cloud Scheduler — Quarterly burn cron ────────────────────

resource "google_cloud_scheduler_job" "quarterly_burn" {
  name        = "arena-quarterly-burn"
  description = "Trigger quarterly 1% $ARENA supply burn"
  schedule    = "0 0 1 1,4,7,10 *"
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.game_server.uri}/admin/quarterly-burn"
    headers = {
      "Content-Type" = "application/json"
    }
    oidc_token {
      service_account_email = google_service_account.scheduler_sa.email
    }
  }

  depends_on = [google_project_service.apis]
}

resource "google_service_account" "scheduler_sa" {
  account_id   = "arena-scheduler"
  display_name = "AgentArena Scheduler SA"
}

# ── Secret Manager ───────────────────────────────────────────

resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "gemini-api-key"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "deployer_private_key" {
  secret_id = "deployer-private-key"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "polygon_rpc_url" {
  secret_id = "polygon-rpc-url"
  replication {
    auto {}
  }
}
