/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

// Mocking the store
jest.mock("../app/Store.js", () => ({
  __esModule: true,
  default: {
    bills: jest.fn(() => ({
      list: jest.fn().mockResolvedValue([
        {
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel et logement",
          commentary: "séminaire billed",
          name: "encore",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2004-04-04",
          amount: 400,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20
        },
        // Ajoutez d'autres éléments de test ici si nécessaire
      ]),
      create: jest.fn().mockResolvedValue({
        fileUrl: 'https://localhost:3456/images/test.jpg',
        key: '1234'
      }),
      update: jest.fn().mockResolvedValue({
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20
      })
    }))
  }
}));

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
    );
  });
  // et restaure tous les mocks à leurs états d'origine pour que tous les tests soient isolés (pas indispensable)
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      // Write your expect expression here
      expect(windowIcon.classList).toContain("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
          .getAllByText(
              /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
          )
          .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test("handleClickNewBill should navigate to NewBill page", () => {
      const onNavigate = jest.fn();
      const bills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      bills.handleClickNewBill();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });

    test("handleClickIconEye should display the modal with bill image", () => {
      $.fn.modal = jest.fn();

      document.body.innerHTML = `
        <div id="modaleFile" class="modal">
          <div class="modal-body"></div>
        </div>
      `;

      const onNavigate = jest.fn();
      const bills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const icon = document.createElement("div");
      icon.setAttribute("data-bill-url", "https://test.url/bill.jpg");

      bills.handleClickIconEye(icon);

      const modalBody = document.querySelector(".modal-body");
      expect(modalBody.innerHTML).toContain("https://test.url/bill.jpg");
      expect($.fn.modal).toHaveBeenCalledWith("show");
    });

    test("getBills should fetch and format bills from store", async () => {
      const mockStore = {
        bills: jest.fn().mockImplementation(() => ({
          list: jest.fn().mockResolvedValueOnce([
            {
              id: "1",
              date: "2001-01-01",
              status: "pending",
            },
          ]),
        })),
      };

      const onNavigate = jest.fn();
      const bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const result = await bills.getBills();

      expect(mockStore.bills).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].date).toBe("1 Jan. 01");
    });
  });
//test d'intégration GET
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByTestId("tbody").children.length).toBeGreaterThan(0);
    });
  });
});