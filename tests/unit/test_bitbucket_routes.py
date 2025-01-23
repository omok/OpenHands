import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from openhands.server.app import app

client = TestClient(app)

MOCK_TOKEN = "test-token"
MOCK_HEADERS = {"X-BitBucket-Token": MOCK_TOKEN}


@pytest.fixture
def mock_requests():
    with patch("openhands.server.routes.bitbucket.requests") as mock:
        yield mock


def test_get_repositories_without_token():
    response = client.get("/api/bitbucket/repositories")
    assert response.status_code == 400
    assert response.json()["detail"] == "Missing X-BitBucket-Token header"


def test_get_repositories(mock_requests):
    mock_response = MagicMock()
    mock_response.json.return_value = {"values": [{"name": "test-repo"}]}
    mock_requests.get.return_value = mock_response

    response = client.get("/api/bitbucket/repositories", headers=MOCK_HEADERS)
    assert response.status_code == 200
    assert response.json() == {"values": [{"name": "test-repo"}]}

    mock_requests.get.assert_called_once()
    args, kwargs = mock_requests.get.call_args
    assert args[0] == "https://api.bitbucket.org/2.0/user/repositories"
    assert kwargs["headers"]["Authorization"] == f"Bearer {MOCK_TOKEN}"


def test_get_repositories_with_workspace(mock_requests):
    mock_response = MagicMock()
    mock_response.json.return_value = {"values": [{"name": "test-repo"}]}
    mock_requests.get.return_value = mock_response

    response = client.get(
        "/api/bitbucket/repositories?workspace=test-workspace",
        headers=MOCK_HEADERS,
    )
    assert response.status_code == 200

    mock_requests.get.assert_called_once()
    args, kwargs = mock_requests.get.call_args
    assert args[0] == "https://api.bitbucket.org/2.0/repositories/test-workspace"


def test_get_user(mock_requests):
    mock_response = MagicMock()
    mock_response.json.return_value = {"username": "test-user"}
    mock_requests.get.return_value = mock_response

    response = client.get("/api/bitbucket/user", headers=MOCK_HEADERS)
    assert response.status_code == 200
    assert response.json() == {"username": "test-user"}

    mock_requests.get.assert_called_once()
    args, kwargs = mock_requests.get.call_args
    assert args[0] == "https://api.bitbucket.org/2.0/user"


def test_get_workspaces(mock_requests):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "values": [{"slug": "workspace1"}, {"slug": "workspace2"}]
    }
    mock_requests.get.return_value = mock_response

    response = client.get("/api/bitbucket/workspaces", headers=MOCK_HEADERS)
    assert response.status_code == 200
    assert response.json() == ["workspace1", "workspace2"]

    mock_requests.get.assert_called_once()
    args, kwargs = mock_requests.get.call_args
    assert args[0] == "https://api.bitbucket.org/2.0/workspaces"


def test_search_repositories(mock_requests):
    mock_response = MagicMock()
    mock_response.json.return_value = {"values": [{"name": "test-repo"}]}
    mock_requests.get.return_value = mock_response

    response = client.get(
        "/api/bitbucket/search/repositories?query=test",
        headers=MOCK_HEADERS,
    )
    assert response.status_code == 200
    assert response.json() == {"values": [{"name": "test-repo"}]}

    mock_requests.get.assert_called_once()
    args, kwargs = mock_requests.get.call_args
    assert args[0] == "https://api.bitbucket.org/2.0/repositories"
    assert kwargs["params"]["q"] == 'name~"test"'