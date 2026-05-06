import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestsEditPage from "main/pages/RecommendationRequests/RecommendationRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 2,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("RecommendationRequestsEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    let queryClient;

    beforeEach(() => {
      queryClient = new QueryClient();
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequests", { params: { id: 2 } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Recommendation Request");
      expect(
        screen.queryByTestId("RecommendationRequestForm-id"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    let queryClient;

    beforeEach(() => {
      queryClient = new QueryClient();
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequests", { params: { id: 2 } })
        .reply(200, recommendationRequestFixtures.oneRecommendationRequest);
      axiosMock.onPut("/api/recommendationrequests").reply(200, {
        id: "2",
        requesterEmail: "dongyi_xia_updated@ucsb.edu",
        professorEmail: "pconrad@cs.ucsb.edu",
        explanation: "BSMS updated",
        dateRequested: "2026-01-01T08:00:00",
        dateNeeded: "2026-05-01T08:00:00",
        done: false,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const professorEmailField = screen.getByLabelText("Professor Email");
      const explanationField = screen.getByLabelText("Explanation");
      const submitButton = screen.getByRole("button", { name: "Update" });

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("2");
      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("dongyi_xia@uscb.edu");
      expect(professorEmailField).toBeInTheDocument();
      expect(professorEmailField).toHaveValue("pconrad@cs.ucsb.edu");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("BSMS");
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "dongyi_xia_updated@ucsb.edu" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "pconrad@cs.ucsb.edu" },
      });
      fireEvent.change(explanationField, {
        target: { value: "BSMS updated" },
      });
      fireEvent.change(screen.getByLabelText("Done"), {
        target: { value: "true" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Recommendation Request Updated - id: 2 requesterEmail: dongyi_xia_updated@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequests" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 2 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "dongyi_xia_updated@ucsb.edu",
          professorEmail: "pconrad@cs.ucsb.edu",
          explanation: "BSMS updated",
          dateRequested: "2026-01-01T08:00:00",
          dateNeeded: "2026-05-01T08:00:00",
          done: "true",
        }),
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const professorEmailField = screen.getByLabelText("Professor Email");
      const explanationField = screen.getByLabelText("Explanation");
      const submitButton = screen.getByRole("button", { name: "Update" });

      expect(idField).toHaveValue("2");
      expect(requesterEmailField).toHaveValue("dongyi_xia@uscb.edu");
      expect(professorEmailField).toHaveValue("pconrad@cs.ucsb.edu");
      expect(explanationField).toHaveValue("BSMS");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(requesterEmailField, {
        target: { value: "dongyi_xia_updated@ucsb.edu" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "pconrad@cs.ucsb.edu" },
      });
      fireEvent.change(explanationField, {
        target: { value: "BSMS updated" },
      });
      fireEvent.change(screen.getByLabelText("Done"), {
        target: { value: "true" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Recommendation Request Updated - id: 2 requesterEmail: dongyi_xia_updated@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequests" });
    });
  });
});
