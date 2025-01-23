import requests
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse

from openhands.server.shared import openhands_config
from openhands.utils.async_utils import call_sync_from_async

app = APIRouter(prefix='/api/bitbucket')


def require_bitbucket_token(request: Request):
    bitbucket_token = request.headers.get('X-BitBucket-Token')
    if not bitbucket_token:
        raise HTTPException(
            status_code=400,
            detail='Missing X-BitBucket-Token header',
        )
    return bitbucket_token


@app.get('/repositories')
async def get_bitbucket_repositories(
    page: int = 1,
    per_page: int = 10,
    sort: str = 'updated_on',
    workspace: str | None = None,
    bitbucket_token: str = Depends(require_bitbucket_token),
):
    # Add query parameters
    params: dict[str, str] = {
        'page': str(page),
        'pagelen': str(per_page),
        'sort': sort,
    }

    # Construct the BitBucket API URL
    if workspace:
        bitbucket_api_url = f'https://api.bitbucket.org/2.0/repositories/{workspace}'
    else:
        # Get repositories for the authenticated user
        bitbucket_api_url = 'https://api.bitbucket.org/2.0/user/repositories'

    # Set the authorization header with the BitBucket token
    headers = generate_bitbucket_headers(bitbucket_token)

    # Fetch repositories from BitBucket
    try:
        response = await call_sync_from_async(
            requests.get, bitbucket_api_url, headers=headers, params=params
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=response.status_code if response else 500,
            detail=f'Error fetching repositories: {str(e)}',
        )

    # Create response with the JSON content
    json_response = JSONResponse(content=response.json())
    response.close()

    return json_response


@app.get('/user')
async def get_bitbucket_user(bitbucket_token: str = Depends(require_bitbucket_token)):
    headers = generate_bitbucket_headers(bitbucket_token)
    try:
        response = await call_sync_from_async(
            requests.get, 'https://api.bitbucket.org/2.0/user', headers=headers
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=response.status_code if response else 500,
            detail=f'Error fetching user: {str(e)}',
        )

    json_response = JSONResponse(content=response.json())
    response.close()

    return json_response


@app.get('/workspaces')
async def get_bitbucket_workspaces(
    bitbucket_token: str = Depends(require_bitbucket_token),
):
    headers = generate_bitbucket_headers(bitbucket_token)
    try:
        response = await call_sync_from_async(
            requests.get,
            'https://api.bitbucket.org/2.0/workspaces',
            headers=headers,
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=response.status_code if response else 500,
            detail=f'Error fetching workspaces: {str(e)}',
        )

    data = response.json()
    workspaces = [workspace['slug'] for workspace in data['values']]
    json_response = JSONResponse(content=workspaces)
    response.close()

    return json_response


@app.get('/search/repositories')
async def search_bitbucket_repositories(
    query: str,
    per_page: int = 5,
    sort: str = 'updated_on',
    bitbucket_token: str = Depends(require_bitbucket_token),
):
    headers = generate_bitbucket_headers(bitbucket_token)
    params = {
        'q': f'name~"{query}"',
        'pagelen': per_page,
        'sort': sort,
    }

    try:
        response = await call_sync_from_async(
            requests.get,
            'https://api.bitbucket.org/2.0/repositories',
            headers=headers,
            params=params,
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=response.status_code if response else 500,
            detail=f'Error searching repositories: {str(e)}',
        )

    json_response = JSONResponse(content=response.json())
    response.close()

    return json_response


def generate_bitbucket_headers(token: str) -> dict[str, str]:
    return {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json',
    }