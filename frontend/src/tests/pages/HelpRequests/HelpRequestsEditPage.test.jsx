import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import HelpRequestsEditPage from "main/pages/HelpRequest/HelpRequestsEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
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
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("HelpRequestsEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Help Request");
      expect(
        screen.queryByTestId("HelpRequests-requesterEmail"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).reply(200, {
        id: 17,
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "team-02",
        tableOrBreakoutRoom: "2",
        requestTime: "2026-05-02T05:05",
        explanation: "Help with dokku deployment",
        solved: "false",
      });
      axiosMock.onPut("/api/helprequests").reply(200, {
        id: 17,
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "team-02",
        tableOrBreakoutRoom: "2",
        requestTime: "2026-05-02T05:05",
        explanation: "Help with dokku deployments",
        solved: "true",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-id");

      const idField = screen.getByTestId("HelpRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "HelpRequestForm-requesterEmail",
      );
      const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
      const tableOrBreakoutRoomField = screen.getByTestId(
        "HelpRequestForm-tableOrBreakoutRoom",
      );
      const requestTimeField = screen.getByTestId(
        "HelpRequestForm-requestTime",
      );
      const explanationField = screen.getByTestId(
        "HelpRequestForm-explanation",
      );
      const solvedField = screen.getByTestId("HelpRequestForm-solved");
      const submitButton = screen.getByRole("button", { name: "Update" });

      expect(idField).toHaveValue("17");
      expect(requesterEmailField).toHaveValue("cgaucho@ucsb.edu");
      expect(teamIdField).toHaveValue("team-02");
      expect(tableOrBreakoutRoomField).toHaveValue("2");
      expect(requestTimeField).toHaveValue("2026-05-02T05:05");
      expect(explanationField).toHaveValue("Help with dokku deployment");
      expect(solvedField).toHaveValue("false");
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "cgaucho@ucsb.edu" },
      });
      fireEvent.change(teamIdField, { target: { value: "team-02" } });
      fireEvent.change(tableOrBreakoutRoomField, { target: { value: "2" } });
      fireEvent.change(requestTimeField, {
        target: { value: "2026-05-02T05:05" },
      });
      fireEvent.change(explanationField, {
        target: { value: "Help with dokku deployments" },
      });
      fireEvent.change(solvedField, { target: { value: "true" } });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Help Request Updated - id: 17 requesterEmail: cgaucho@ucsb.edu",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/helprequests" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "cgaucho@ucsb.edu",
          teamId: "team-02",
          tableOrBreakoutRoom: "2",
          requestTime: "2026-05-02T05:05",
          explanation: "Help with dokku deployments",
          solved: "true",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-id");

      const idField = screen.getByTestId("HelpRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "HelpRequestForm-requesterEmail",
      );
      const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
      const tableOrBreakoutRoomField = screen.getByTestId(
        "HelpRequestForm-tableOrBreakoutRoom",
      );
      const requestTimeField = screen.getByTestId(
        "HelpRequestForm-requestTime",
      );
      const explanationField = screen.getByTestId(
        "HelpRequestForm-explanation",
      );
      const solvedField = screen.getByTestId("HelpRequestForm-solved");
      const submitButton = screen.getByRole("button", { name: "Update" });

      expect(idField).toHaveValue("17");
      expect(requesterEmailField).toHaveValue("cgaucho@ucsb.edu");
      expect(teamIdField).toHaveValue("team-02");
      expect(tableOrBreakoutRoomField).toHaveValue("2");
      expect(requestTimeField).toHaveValue("2026-05-02T05:05");
      expect(explanationField).toHaveValue("Help with dokku deployment");
      expect(solvedField).toHaveValue("false");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(requesterEmailField, {
        target: { value: "cgaucho@ucsb.edu" },
      });
      fireEvent.change(teamIdField, { target: { value: "team-02" } });
      fireEvent.change(tableOrBreakoutRoomField, { target: { value: "2" } });
      fireEvent.change(requestTimeField, {
        target: { value: "2026-05-02T05:05" },
      });
      fireEvent.change(explanationField, {
        target: { value: "Help with dokku deployments" },
      });
      fireEvent.change(solvedField, { target: { value: "true" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Help Request Updated - id: 17 requesterEmail: cgaucho@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/helprequests" });
    });
  });
});
