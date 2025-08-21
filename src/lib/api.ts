const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  mode: "text" | "voice";
}

export interface NewChatResponse {
  message: string;
  timestamp: string;
  memory_cleared: boolean;
}

export interface VoiceRequest {
  text: string;
  voice?: string;
}

export interface HealthResponse {
  status: string;
}

export async function sendChatMessage(
  request: ChatRequest,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");

  // Handle streaming response
  if (
    contentType?.includes("text/event-stream") ||
    contentType?.includes("text/plain")
  ) {
    if (!response.body) {
      throw new Error("No response body for streaming");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        if (onChunk) {
          onChunk(chunk);
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse;
  }

  // Handle JSON response
  const data = await response.json();
  if (data.response) {
    return data.response;
  }

  throw new Error("Invalid response format");
}

export async function newChat(): Promise<NewChatResponse> {
  const response = await fetch(`${API_BASE_URL}/new_chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.message) {
    return data;
  }
  throw new Error("Invalid response format");
}

export async function synthesizeVoice(request: VoiceRequest): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/voice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.blob();
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.status) {
    return data;
  }
  throw new Error("Invalid response format");
}
