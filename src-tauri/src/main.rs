use reqwest::Method;
use serde::Deserialize;
use serde_json::Value;
use url::Url;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AwProxyRequest {
    base_url: String,
    method: String,
    path: String,
    body: Option<Value>,
}

#[tauri::command]
async fn aw_request(request: AwProxyRequest) -> Result<Value, String> {
    let method = Method::from_bytes(request.method.as_bytes())
        .map_err(|error| format!("Invalid HTTP method: {error}"))?;
    let url = build_aw_url(&request.base_url, &request.path)?;
    let client = reqwest::Client::new();
    let mut builder = client.request(method, url).header("accept", "application/json");

    if let Some(body) = request.body {
        builder = builder.json(&body);
    }

    let response = builder
        .send()
        .await
        .map_err(|error| format!("Could not reach ActivityWatch: {error}"))?;
    let status = response.status();
    let text = response
        .text()
        .await
        .map_err(|error| format!("Could not read ActivityWatch response: {error}"))?;

    if !status.is_success() {
        return Err(format!("ActivityWatch returned {status}: {text}"));
    }

    serde_json::from_str(&text).map_err(|error| format!("Invalid ActivityWatch JSON: {error}"))
}

fn build_aw_url(base_url: &str, path: &str) -> Result<Url, String> {
    let trimmed = base_url.trim().trim_end_matches('/');
    let normalized = if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        trimmed.to_string()
    } else {
        format!("http://{trimmed}")
    };
    let base = Url::parse(&normalized).map_err(|error| format!("Invalid ActivityWatch URL: {error}"))?;
    base.join(path).map_err(|error| format!("Invalid ActivityWatch path: {error}"))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![aw_request])
        .run(tauri::generate_context!())
        .expect("error while running Fotion");
}
