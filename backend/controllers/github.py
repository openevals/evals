import httpx
import os
from fastapi import HTTPException


async def get_github_data(url, access_token):
    """Get Github information from the given URL"""
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {access_token}",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail={"error": "error-fetching-github-information"},
            )
        return response.json()


async def exchange_auth_code(code):
    """Exchange Github authorization code by access token"""
    url = "https://github.com/login/oauth/access_token"
    data = {
        "client_id": os.getenv("GITHUB_CLIENT_ID"),
        "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
        "code": code,
        "redirect_uri": f"{os.getenv('WEB_URL')}/auth/github",
    }
    headers = {
        "Accept": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data, headers=headers)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, detail="Error fetching GitHub token"
            )
        return response.json()


async def get_user_info(access_token):
    """Get Github user profile information"""
    return await get_github_data("https://api.github.com/user", access_token)


async def get_user_emails(access_token):
    """Get Github user emails information"""
    return await get_github_data("https://api.github.com/user/emails", access_token)
