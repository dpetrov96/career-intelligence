from app.services.resume_analysis_service import analyze_resume_for_linkedin


def test_analyze_resume_uses_sofia_location_without_llm(monkeypatch) -> None:
    monkeypatch.setattr(
        "app.services.resume_analysis_service.settings.openai_api_key",
        None,
    )

    profile = analyze_resume_for_linkedin(
        "Backend Engineer based in Sofia, Bulgaria."
    )

    assert profile.keywords == "Backend Engineer"
    assert profile.location == "Bulgaria"
    assert profile.geo_id == "105333783"


def test_analyze_resume_defaults_for_empty_cv(monkeypatch) -> None:
    monkeypatch.setattr(
        "app.services.resume_analysis_service.settings.openai_api_key",
        None,
    )

    profile = analyze_resume_for_linkedin("")

    assert profile.keywords == "software engineer"
    assert profile.location == "Bulgaria"
