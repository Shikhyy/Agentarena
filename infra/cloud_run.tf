# Cloud Run — Game Server

resource "google_cloud_run_v2_service" "game_server" {
  name     = "agentarena-game-server"
  location = var.region

  template {
    containers {
      image = "gcr.io/${var.project_id}/agentarena-backend:latest"

      ports {
        container_port = 8000
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "1Gi"
        }
      }

      env {
        name  = "GEMINI_API_KEY"
        value = var.gemini_api_key
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 1000
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

variable "gemini_api_key" {
  description = "Gemini API Key"
  type        = string
  sensitive   = true
  default     = ""
}

# Allow unauthenticated access
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.game_server.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "game_server_url" {
  value = google_cloud_run_v2_service.game_server.uri
}
