import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm.jsx";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures.js";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
    const originalModule = await vi.importActual("react-router");
    return {
        ...originalModule,
        useNavigate: () => mockedNavigate,
    };
});

describe("UCSBDiningCommonsMenuItemForm tests", () => {
    test("renders correctly", async () => {
        render(
            <Router>
                <UCSBDiningCommonsMenuItemForm/>
            </Router>,
        );
        await screen.findByText(/Dining Commons Code/);
        await screen.findByText(/Create/);
        expect(screen.getByText(/Station/)).toBeInTheDocument();
    });

    test("renders correctly when passing in a UCSBDiningCommonsMenuItem", async () => {
        render(
            <Router>
                <UCSBDiningCommonsMenuItemForm initialContents={ucsbDiningCommonsMenuItemFixtures.oneMenuItem} />
            </Router>,
        );
        await screen.findByTestId(/UCSBDiningCommonsMenuItem-id/);
        expect(screen.getByText(/Id/)).toBeInTheDocument();
        expect(screen.getByTestId(/UCSBDiningCommonsMenuItem-id/)).toHaveValue("1");
    });

    test("Correct Error messages on bad input", async () => {
        render(
            <Router>
                <UCSBDiningCommonsMenuItemForm/>
            </Router>,
        );
        await screen.findByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode");
        const menuItemDiningCommonsCode = screen.getByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode");
        const submitButton = screen.getByTestId("UCSBDiningCommonsMenuItem-submit");

        fireEvent.change(menuItemDiningCommonsCode, { target: { value: "bad-input" } });
        fireEvent.click(submitButton);

        await screen.findByText(/Must be one of: portola, ortega, carillo, dlg/);
        expect(
            screen.getByText(/Must be one of: portola, ortega, carillo, dlg/),
        ).toBeInTheDocument();
    });

    test("Correct Error messsages on missing input", async () => {
        render(
            <Router>
                <UCSBDiningCommonsMenuItemForm/>
            </Router>,
        );
        await screen.findByTestId("UCSBDiningCommonsMenuItem-submit");
        const submitButton = screen.getByTestId("UCSBDiningCommonsMenuItem-submit");
        fireEvent.click(submitButton);

        await screen.findByText(/Dining Commons Code is required/);
        expect(screen.getByText(/Station is required/)).toBeInTheDocument();
        expect(screen.getByText(/Name is required/)).toBeInTheDocument();
    });

    /* cover for mutation removing each valid dining commons code individually */
    test.each(["portola", "ortega", "carillo", "dlg"])(
        "accepts valid dining commons code: %s",
        async(code) => {
            const mockSubmitAction = vi.fn();
            render(
                <Router>
                    <UCSBDiningCommonsMenuItemForm submitAction={mockSubmitAction} />
                </Router>,
            );
            await screen.findByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode");
            fireEvent.change(screen.getByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode"), { target: { value: code } });
            fireEvent.change(screen.getByTestId("UCSBDiningCommonsMenuItem-station"), { target: { value: "entrees" } });
            fireEvent.change(screen.getByTestId("UCSBDiningCommonsMenuItem-name"), { target: { value: "Dish" } });
            fireEvent.click(screen.getByTestId("UCSBDiningCommonsMenuItem-submit"));
            await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
            expect(screen.queryByText(/Must be one of/)).not.toBeInTheDocument();
        }
    );

    test("No Error messsages on good input", async () => {
        const mockSubmitAction = vi.fn();

        render(
            <Router>
                <UCSBDiningCommonsMenuItemForm submitAction={mockSubmitAction} />
            </Router>,
        );
        await screen.findByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode");

        const diningCommonsCodeField = screen.getByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode");
        const stationField = screen.getByTestId("UCSBDiningCommonsMenuItem-station");
        const nameField = screen.getByTestId("UCSBDiningCommonsMenuItem-name");
        const submitButton = screen.getByTestId("UCSBDiningCommonsMenuItem-submit");

        fireEvent.change(diningCommonsCodeField, { target: { value: "portola" } });
        fireEvent.change(stationField, { target: { value: "entrees" } });
        fireEvent.change(nameField, { target: { value: "Chicken and rice" }, });
        fireEvent.click(submitButton);

        await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

        expect(
            screen.queryByText(/Must be one of: portola, ortega, carillo, dlg/),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(/Dining Commons Code is required/),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(/Station is required/),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(/Name is required/),
        ).not.toBeInTheDocument();
    });

    test("that navigate(-1) is called when Cancel is clicked", async () => {
        render(
            <Router>
                <UCSBDiningCommonsMenuItemForm />
            </Router>,
        );
        await screen.findByTestId("UCSBDiningCommonsMenuItem-cancel");
        const cancelButton = screen.getByTestId("UCSBDiningCommonsMenuItem-cancel");

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
    });
});
