def test_api_health_reports_dependencies(client) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["database"] == "ok"
    assert "llm_configured" in payload


def test_root_redirects_to_swagger(client) -> None:
    response = client.get("/", follow_redirects=False)

    assert response.status_code in {307, 308}
    assert response.headers["location"] == "/docs"
