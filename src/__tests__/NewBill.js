/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES_PATH } from '../constants/routes.js'

// Mocking the store
jest.mock("../app/Store.js", () => ({
  bills: jest.fn(() => ({
    create: jest.fn().mockResolvedValue({
      id: '1234',
      vat: "70",
      fileUrl: "https://url/to/file.png",
      status: "pending",
      type: "Transport",
      commentary: "Business trip",
      name: "Train ticket",
      fileName: "file.png",
      date: "2021-09-10",
      amount: 50,
      pct: 20
    }),
    update: jest.fn().mockResolvedValue({})
  })),
}));

describe("Given I am connected as an employee", () => {
  //avant chaque test, je m'assure que les tests sont fait sur les données mockées
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    // Stocke un objet JSON stringifié
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: 'a@a.com'
    }));

    const userCheck = localStorage.getItem('user');
    console.log("User check in beforeEach:", userCheck);

    // Vérifie que le contenu est correct
    try {
      const userParsedCheck = JSON.parse(userCheck);
      console.log("User parsed check in beforeEach:", userParsedCheck);
    } catch (error) {
      console.error("Error parsing user data in beforeEach:", error);
    }

    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  // et restaure tous les mocks à leurs états d'origine pour que tous les tests soient isolés (pas indispensable)
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("When I am on NewBill Page", () => {
    test("Then it should render a form with required fields: name, amount, date, type and file", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      // to-do write assertion
      expect(screen.getByTestId('expense-name')).toBeTruthy();
      expect(screen.getByTestId('datepicker')).toBeTruthy();
      expect(screen.getByTestId('expense-type')).toBeTruthy();
      expect(screen.getByTestId('amount')).toBeTruthy();
      expect(screen.getByTestId('file')).toBeTruthy();
    });

    test("Then it should have a default value for the date field", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const dateInput = screen.getByTestId('datepicker');
      expect(dateInput.value).toBe("");
    });

    test("Then it should initialize the NewBill class", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });

      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();

      const fileInput = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      fileInput.addEventListener("change", handleChangeFile);

      fireEvent.change(fileInput, { target: { files: [new File([""], "filename.png", { type: "image/png" })] } });

      expect(handleChangeFile).toHaveBeenCalled();
    });
  });

  describe("When I upload an invalid file", () => {
    test("Then it should alert an error message and reset the input value", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      const fileInput = screen.getByTestId("file");

      const file = new File(["Ma note de frais"], "frais.pdf", { type: "application/pdf" });

      Object.defineProperty(fileInput, "files", {
        value: [file],
      });

      fireEvent.change(fileInput);

      expect(window.alert).toHaveBeenCalledWith('Seuls les fichiers PNG, JPG, JPEG sont autorisés.');
      expect(fileInput.value).toBe("");
    });
  });

  describe("When I have entered all the necessary fields and pressed the send button", () => {
    test("Then handleSubmit should update a new bill and navigate to Bills page", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });

      newBill.fileUrl = "https://url/to/file.png";
      newBill.fileName = "file.png";

      // Rempli le formulaire
      fireEvent.change(screen.getByTestId('expense-type'), { target: { value: "Transport" } });
      fireEvent.change(screen.getByTestId('expense-name'), { target: { value: "Train ticket" } });
      fireEvent.change(screen.getByTestId('amount'), { target: { value: 50 } });
      fireEvent.change(screen.getByTestId('datepicker'), { target: { value: "2021-09-10" } });
      fireEvent.change(screen.getByTestId('vat'), { target: { value: "70" } });
      fireEvent.change(screen.getByTestId('pct'), { target: { value: 20 } });
      fireEvent.change(screen.getByTestId('commentary'), { target: { value: "Business trip" } });

      // Obtient l'instance de bills mockée
      const billsMock = mockStore.bills();
      const updateSpy = jest.spyOn(billsMock, 'update');

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", newBill.handleSubmit);
      fireEvent.submit(form);

      // Vérifications
      await new Promise(process.nextTick);

      expect(updateSpy).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });
  });

  // POST TESTS
  describe("When I have entered all the necessary fields and pressed the send button", () => {
    test("Then handleSubmit should update a new bill and navigate to Bills page", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });

      newBill.fileUrl = "https://url/to/file.png";
      newBill.fileName = "file.png";

      // Rempli le formulaire
      fireEvent.change(screen.getByTestId('expense-type'), { target: { value: "Transport" } });
      fireEvent.change(screen.getByTestId('expense-name'), { target: { value: "Train ticket" } });
      fireEvent.change(screen.getByTestId('amount'), { target: { value: 50 } });
      fireEvent.change(screen.getByTestId('datepicker'), { target: { value: "2021-09-10" } });
      fireEvent.change(screen.getByTestId('vat'), { target: { value: "70" } });
      fireEvent.change(screen.getByTestId('pct'), { target: { value: 20 } });
      fireEvent.change(screen.getByTestId('commentary'), { target: { value: "Business trip" } });

      // Espionnage de la fonction `update`
      const billsMock = mockStore.bills();
      const updateSpy = jest.spyOn(billsMock, 'update');

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", newBill.handleSubmit);
      fireEvent.submit(form);

      console.log("Submit fired");

      // Vérifie que la fonction `update` a été appelée
      await new Promise(process.nextTick); // Assurez-vous que la promesse a eu le temps de se résoudre

      expect(updateSpy).toHaveBeenCalled();

      // Vérifie la navigation vers la page des bills
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });
  });
});