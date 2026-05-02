import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function UCSBDiningCommonsMenuItemForm({
                          initialContents,
                          submitAction,
                          buttonLabel = "Create",
                      }) {
    // Stryker disable all
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm({ defaultValues: initialContents || {} });
    // Stryker restore all

    const navigate = useNavigate();

    return (
        <Form onSubmit={handleSubmit(submitAction)}>
            <Row>
                {/* if there are initial contents, then show the id as read-only */}
                {initialContents && (
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="id">Id</Form.Label>
                            <Form.Control
                                data-testid="UCSBDiningCommonsMenuItem-id"
                                id="id"
                                type="text"
                                {...register("id")}
                                value={initialContents.id}
                                disabled
                            />
                        </Form.Group>
                    </Col>
                )}

                <Col>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="diningCommonsCode">Dining Commons Code (portola, ortega, carillo, dlg)</Form.Label>
                        <Form.Control
                            data-testid="UCSBDiningCommonsMenuItem-diningCommonsCode"
                            id="diningCommonsCode"
                            type="text"
                            isInvalid={Boolean(errors.diningCommonsCode)}
                            {...register("diningCommonsCode", {
                                required: true,
                                validate: (v) => ["portola", "ortega", "carillo", "dlg"].includes(v) || "Must be one of: portola, ortega, carillo, dlg",
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.diningCommonsCode?.message || (errors.diningCommonsCode && "Dining Commons Code is required")}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="station">Dish Station</Form.Label>
                        {/* currently, for validation, just cannot be empty, but may want to restrict to stations like "entrees" "desserts" etc. */}
                        <Form.Control
                            data-testid="UCSBDiningCommonsMenuItem-station"
                            id="station"
                            type="text"
                            isInvalid={Boolean(errors.station)}
                            {...register("station", {
                                required: "Station is required",
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.station?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="name">Dish Name & Description</Form.Label>
                        <Form.Control
                            data-testid="UCSBDiningCommonsMenuItem-name"
                            id="name"
                            type="text"
                            isInvalid={Boolean(errors.name)}
                            {...register("name", {
                                required: "Name is required",
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Button type="submit" data-testid="UCSBDiningCommonsMenuItem-submit">
                        {buttonLabel}
                    </Button>
                    <Button
                        variant="Secondary"
                        onClick={() => navigate(-1)}
                        data-testid="UCSBDiningCommonsMenuItem-cancel"
                    >
                        Cancel
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

export default UCSBDiningCommonsMenuItemForm;
