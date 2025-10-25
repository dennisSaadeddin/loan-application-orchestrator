import pytest
from decimal import Decimal


@pytest.mark.api
class TestApplicationsAPI:
    """Test Applications API endpoints"""

    async def test_create_application(self, client):
        """Test creating a new application"""
        application_data = {
            "applicant_name": "John Doe",
            "amount": 15000.00,
            "monthly_income": 3000.00,
            "declared_debts": 600.00,
            "country": "ES",
            "loan_purpose": "home renovation"
        }

        response = await client.post("/api/v1/applications", json=application_data)

        assert response.status_code == 201
        data = response.json()
        assert data["applicant_name"] == "John Doe"
        assert data["amount"] == "15000.00"
        assert data["monthly_income"] == "3000.00"
        assert data["country"] == "ES"
        assert "id" in data
        assert "created_at" in data

    async def test_create_application_validation_error(self, client):
        """Test creating application with invalid data"""
        application_data = {
            "applicant_name": "John Doe",
            # Missing required fields
            "country": "ES"
        }

        response = await client.post("/api/v1/applications", json=application_data)

        assert response.status_code == 422  # Validation error

    async def test_list_applications(self, client, sample_application):
        """Test listing all applications"""
        response = await client.get("/api/v1/applications")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(app["id"] == sample_application.id for app in data)

    async def test_get_application_by_id(self, client, sample_application):
        """Test getting specific application"""
        response = await client.get(f"/api/v1/applications/{sample_application.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_application.id
        assert data["applicant_name"] == sample_application.applicant_name

    async def test_get_nonexistent_application(self, client):
        """Test getting application that doesn't exist"""
        response = await client.get("/api/v1/applications/99999")

        assert response.status_code == 404


@pytest.mark.api
class TestPipelinesAPI:
    """Test Pipelines API endpoints"""

    async def test_create_pipeline(self, client):
        """Test creating a new pipeline"""
        pipeline_data = {
            "name": "Test Pipeline",
            "description": "A test pipeline",
            "steps": [
                {
                    "step_type": "dti_rule",
                    "order": 1,
                    "params": {"max_dti": 0.4}
                },
                {
                    "step_type": "amount_policy",
                    "order": 2,
                    "params": {
                        "DE": 35000,
                        "ES": 30000,
                        "FR": 25000,
                        "OTHER": 20000
                    }
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {
                        "type": "step_failed",
                        "step_types": ["dti_rule", "amount_policy"]
                    },
                    "outcome": "REJECTED"
                },
                {
                    "order": 2,
                    "condition": {"type": "default"},
                    "outcome": "APPROVED"
                }
            ]
        }

        response = await client.post("/api/v1/pipelines", json=pipeline_data)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Pipeline"
        assert data["description"] == "A test pipeline"
        assert len(data["steps"]) == 2
        assert len(data["terminal_rules"]) == 2
        assert "id" in data

    async def test_create_pipeline_duplicate_name(self, client, sample_pipeline):
        """Test creating pipeline with duplicate name"""
        pipeline_data = {
            "name": sample_pipeline.name,  # Duplicate name
            "description": "Another pipeline",
            "steps": [
                {
                    "step_type": "dti_rule",
                    "order": 1,
                    "params": {"max_dti": 0.4}
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {"type": "default"},
                    "outcome": "APPROVED"
                }
            ]
        }

        response = await client.post("/api/v1/pipelines", json=pipeline_data)

        assert response.status_code == 400

    async def test_create_pipeline_invalid_step_type(self, client):
        """Test creating pipeline with invalid step type"""
        pipeline_data = {
            "name": "Invalid Pipeline",
            "description": "Pipeline with invalid step",
            "steps": [
                {
                    "step_type": "nonexistent_step",
                    "order": 1,
                    "params": {}
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {"type": "default"},
                    "outcome": "APPROVED"
                }
            ]
        }

        response = await client.post("/api/v1/pipelines", json=pipeline_data)

        assert response.status_code == 400

    async def test_list_pipelines(self, client, sample_pipeline):
        """Test listing all pipelines"""
        response = await client.get("/api/v1/pipelines")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(p["id"] == sample_pipeline.id for p in data)

    async def test_get_pipeline_by_id(self, client, sample_pipeline):
        """Test getting specific pipeline"""
        response = await client.get(f"/api/v1/pipelines/{sample_pipeline.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_pipeline.id
        assert data["name"] == sample_pipeline.name

    async def test_get_nonexistent_pipeline(self, client):
        """Test getting pipeline that doesn't exist"""
        response = await client.get("/api/v1/pipelines/99999")

        assert response.status_code == 404

    async def test_update_pipeline(self, client, sample_pipeline):
        """Test updating pipeline configuration"""
        update_data = {
            "name": sample_pipeline.name,
            "description": "Updated description",
            "steps": [
                {
                    "step_type": "dti_rule",
                    "order": 1,
                    "params": {"max_dti": 0.5}  # Changed param
                }
            ],
            "terminal_rules": [
                {
                    "order": 1,
                    "condition": {"type": "default"},
                    "outcome": "NEEDS_REVIEW"
                }
            ]
        }

        response = await client.put(
            f"/api/v1/pipelines/{sample_pipeline.id}",
            json=update_data
        )

        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated description"
        assert data["steps"][0]["params"]["max_dti"] == 0.5

    async def test_update_nonexistent_pipeline(self, client):
        """Test updating pipeline that doesn't exist"""
        update_data = {
            "name": "Nonexistent",
            "description": "Test",
            "steps": [],
            "terminal_rules": []
        }

        response = await client.put("/api/v1/pipelines/99999", json=update_data)

        assert response.status_code == 404


@pytest.mark.api
class TestRunsAPI:
    """Test Runs API endpoints"""

    async def test_create_run(self, client, sample_application, sample_pipeline):
        """Test executing a run"""
        run_data = {
            "application_id": sample_application.id,
            "pipeline_id": sample_pipeline.id
        }

        response = await client.post("/api/v1/runs", json=run_data)

        assert response.status_code == 201
        data = response.json()
        assert data["application_id"] == sample_application.id
        assert data["pipeline_id"] == sample_pipeline.id
        assert data["status"] in ["APPROVED", "REJECTED", "NEEDS_REVIEW"]
        assert "step_logs" in data
        assert len(data["step_logs"]) > 0
        assert "started_at" in data
        assert "completed_at" in data

    async def test_create_run_nonexistent_application(self, client, sample_pipeline):
        """Test creating run with nonexistent application"""
        run_data = {
            "application_id": 99999,
            "pipeline_id": sample_pipeline.id
        }

        response = await client.post("/api/v1/runs", json=run_data)

        assert response.status_code == 404

    async def test_create_run_nonexistent_pipeline(self, client, sample_application):
        """Test creating run with nonexistent pipeline"""
        run_data = {
            "application_id": sample_application.id,
            "pipeline_id": 99999
        }

        response = await client.post("/api/v1/runs", json=run_data)

        assert response.status_code == 404

    async def test_get_run_by_id(self, client, sample_application, sample_pipeline):
        """Test getting specific run"""
        # First create a run
        run_data = {
            "application_id": sample_application.id,
            "pipeline_id": sample_pipeline.id
        }
        create_response = await client.post("/api/v1/runs", json=run_data)
        run_id = create_response.json()["id"]

        # Then retrieve it
        response = await client.get(f"/api/v1/runs/{run_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == run_id
        assert data["application_id"] == sample_application.id
        assert data["pipeline_id"] == sample_pipeline.id

    async def test_get_nonexistent_run(self, client):
        """Test getting run that doesn't exist"""
        response = await client.get("/api/v1/runs/99999")

        assert response.status_code == 404

    async def test_run_step_logs_structure(self, client, sample_application, sample_pipeline):
        """Test that run step logs have correct structure"""
        run_data = {
            "application_id": sample_application.id,
            "pipeline_id": sample_pipeline.id
        }

        response = await client.post("/api/v1/runs", json=run_data)

        assert response.status_code == 201
        data = response.json()

        # Verify step logs structure
        for step_log in data["step_logs"]:
            assert "step_type" in step_log
            assert "order" in step_log
            assert "passed" in step_log
            assert "details" in step_log
            assert "executed_at" in step_log
            assert isinstance(step_log["passed"], bool)

    async def test_run_approved_scenario(self, client, db_session, sample_pipeline):
        """Test complete approved scenario"""
        from app.models.application import Application

        # Create Ana's application
        application = Application(
            applicant_name="Ana",
            amount=Decimal("12000.00"),
            monthly_income=Decimal("4000.00"),
            declared_debts=Decimal("500.00"),
            country="ES",
            loan_purpose="home renovation"
        )
        db_session.add(application)
        await db_session.commit()
        await db_session.refresh(application)

        run_data = {
            "application_id": application.id,
            "pipeline_id": sample_pipeline.id
        }

        response = await client.post("/api/v1/runs", json=run_data)

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "APPROVED"

    async def test_run_rejected_scenario(self, client, db_session, sample_pipeline):
        """Test complete rejected scenario"""
        from app.models.application import Application

        # Create Luis's application (high DTI, high amount)
        application = Application(
            applicant_name="Luis",
            amount=Decimal("28000.00"),
            monthly_income=Decimal("2000.00"),
            declared_debts=Decimal("1200.00"),
            country="OTHER",
            loan_purpose="business expansion"
        )
        db_session.add(application)
        await db_session.commit()
        await db_session.refresh(application)

        run_data = {
            "application_id": application.id,
            "pipeline_id": sample_pipeline.id
        }

        response = await client.post("/api/v1/runs", json=run_data)

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "REJECTED"

    async def test_run_needs_review_scenario(self, client, db_session, sample_pipeline):
        """Test complete needs review scenario"""
        from app.models.application import Application

        # Create Mia's application (moderate risk)
        application = Application(
            applicant_name="Mia",
            amount=Decimal("20000.00"),
            monthly_income=Decimal("3000.00"),
            declared_debts=Decimal("900.00"),
            country="FR",
            loan_purpose="car purchase"
        )
        db_session.add(application)
        await db_session.commit()
        await db_session.refresh(application)

        # Update pipeline to have FR cap
        from app.models.pipeline import Pipeline
        pipeline = await db_session.get(Pipeline, sample_pipeline.id)
        pipeline.steps[1]["params"]["FR"] = 25000
        await db_session.commit()
        await db_session.refresh(pipeline)

        run_data = {
            "application_id": application.id,
            "pipeline_id": pipeline.id
        }

        response = await client.post("/api/v1/runs", json=run_data)

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "NEEDS_REVIEW"


@pytest.mark.api
class TestHealthCheck:
    """Test health check endpoint"""

    async def test_health_check(self, client):
        """Test health check endpoint"""
        response = await client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"

    async def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = await client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
