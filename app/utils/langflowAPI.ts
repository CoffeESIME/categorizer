const BASE_URL = process.env.NEXT_PUBLIC_LANGFLOW_URL;
const FLOW_ID = process.env.NEXT_PUBLIC_FLOW_ID_OCR;

export async function getImage(filename: string): Promise<Blob> {
  const url = `${BASE_URL}/api/v1/files/images/${FLOW_ID}/${filename}`;
  const response = await fetch(url, {});
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
}

export async function uploadJSON(jsonData: object): Promise<any> {
  const url = `${BASE_URL}/api/v1/flows/upload/`; // O la ruta que corresponda
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonData),
  });
  if (!response.ok) {
    throw new Error(`Failed to upload JSON: ${response.statusText}`);
  }
  return await response.json();
}

export async function getInitData(): Promise<any> {
  const url = `${BASE_URL}/api/v1/flows/${FLOW_ID}`;
  const response = await fetch(url, {});
  if (!response.ok) {
    throw new Error(`Failed to get init data: ${response.statusText}`);
  }
  return await response.json();
}

export async function sendMessage(message: string): Promise<any> {
  const url = `${BASE_URL}/api/v1/run/${FLOW_ID}?stream=false`;
  const payload = { message };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }
  return await response.json();
}

export async function getMessages(
  params?: Record<string, string>
): Promise<any> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";

  const url = `${BASE_URL}/api/v1/monitor/messages${query}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get messages: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export async function sendConfig(config: object): Promise<any> {
  const url = `${BASE_URL}/api/v1/config`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    throw new Error(`Failed to send config: ${response.statusText}`);
  }
  return await response.json();
}

export async function requestQuery(query: string): Promise<any> {
  const url = `${BASE_URL}/api/v1/run/${FLOW_ID}?stream=false`;
  const payload = { message: query };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to request query: ${response.statusText}`);
  }
  return await response.json();
}

export async function uploadImage(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${BASE_URL}/api/v1/files/upload/${FLOW_ID}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error uploading file to Langflow: ${response.statusText}`);
  }

  return await response.json();
}

interface Variables {
  image_path: string;
}

export async function updateVariables(variables: Variables): Promise<any> {
  const url = `${BASE_URL}/api/v1/flows/${FLOW_ID}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tweaks: {
        "CustomComponent-qAPuk": {
          image_path: variables.image_path,
        },
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update variables: ${response.statusText}`);
  }
  return await response.json();
}
interface VariablesTweak {
  image_path: string;
}
export async function runFlow(variablesTweak: VariablesTweak): Promise<any> {
  const url = `${BASE_URL}/api/v1/run/${FLOW_ID}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // <-- Muy importante
    },
    body: JSON.stringify({
      input_type: "chat",
      output_type: "chat",
      tweaks: {
        "CustomComponent-qAPuk": {
          image_path: variablesTweak.image_path,
        },
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to run flow: ${response.statusText}`);
  }
  return await response.json();
}
export async function listFiles(): Promise<any> {
  const url = `${BASE_URL}/api/v1/files/list/${FLOW_ID}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch files: ${response.statusText}`);
  }

  return await response.json();
}
