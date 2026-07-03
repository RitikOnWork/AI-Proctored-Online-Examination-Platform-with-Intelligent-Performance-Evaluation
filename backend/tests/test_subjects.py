import pytest
import uuid

pytestmark = pytest.mark.asyncio


async def test_subject_crud(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")

    # 1. Create subject
    name = f"Subj_{uuid.uuid4().hex[:6]}"
    res = await client.post(
        "/api/v1/subjects",
        json={"name": name, "description": "Subject test"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 201
    subj_id = res.json()["id"]

    # 2. Get subject
    res = await client.get(f"/api/v1/subjects/{subj_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert res.json()["name"] == name

    # 3. List subjects
    res = await client.get("/api/v1/subjects", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 4. Update subject
    res = await client.patch(
        f"/api/v1/subjects/{subj_id}",
        json={"name": name + "_updated", "description": "New description"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    assert res.json()["name"] == name + "_updated"

    # 5. Delete subject
    res = await client.delete(f"/api/v1/subjects/{subj_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200

    # 6. Try to get deleted subject (Should fail 404)
    res = await client.get(f"/api/v1/subjects/{subj_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 404
