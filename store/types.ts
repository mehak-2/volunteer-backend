export interface Activity {
  id: number;
  description: string;
  volunteer: string;
  timestamp: string;
  type:
    | "volunteer_approved"
    | "volunteer_rejected"
    | "emergency_alert"
    | "emergency_response"
    | "volunteer_registered";
}
