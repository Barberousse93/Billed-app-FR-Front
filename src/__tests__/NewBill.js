/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import { ROUTES } from "../constants/routes.js"

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
}

describe("Composant NEWBILL", () => {
  describe("Quand j'affiche le formulaire NewBill", () => {
    mockStore.bills.create = jest.fn().mockResolvedValue({
      fileUrl: "mockedUrl",
      key: "mockedKey",
    })
    mockStore.bills.update = jest.fn()

    it("La page s'affiche correctement.", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const html = NewBillUI()
      document.body.innerHTML = html
      // je génère la page Bills avec les données mockées
      const newBill = new NewBill({
        document,
        onNavigate,
        mockStore,
        localStorageMock,
      })
      const titre = await screen.getByText("Envoyer une note de frais")
      expect(titre).toBeTruthy()
    })

    it("Doit refuser les fichiers autres que image dans la zone justificatif", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      )
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        mockLocalStorage,
      })

      const event = { target: { value: "test.jpg" }, preventDefault: jest.fn() }
      newBill.handleChangeFile(event)
      const errorMsg = screen.getByTestId("ErrorMsg")
      expect(errorMsg).not.toHaveClass("visible")

      const event2 = {
        target: { value: "test.txt" },
        preventDefault: jest.fn(),
      }
      newBill.handleChangeFile(event2)
      expect(errorMsg).toHaveClass("visible")
    })
  })

  describe("Gérer la soumission du formulaire", () => {
    it("Envoie le formulaire et revient sur la page 'Bills'", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      )
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        mockLocalStorage,
      })

      mockStore.bills.update.mockResolvedValue({})
      const eventMock = {
        preventDefault: jest.fn(),
        target: document.querySelector('form[data-testid="form-new-bill"]'),
      }

      newBill.handleSubmit(eventMock)

      expect(eventMock.preventDefault).toHaveBeenCalledTimes(1)
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })

    it("N'envoie pas le formulaire en cas d'erreur sur le format d'image et reste sur 'NewBill'", () => {
      const mockOnNavigate = jest.fn()

      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      )
      const html = `
      <form data-testid="form-new-bill">
        <select data-testid="expense-type" value="Type"></select>
        <input data-testid="expense-name" value="Test Expense">
        <input data-testid="amount" value="100">
        <input data-testid="datepicker" value="2023-10-23">
        <input data-testid="vat" value="20">
        <input data-testid="pct" value="10">
        <input required type="file" class="form-control blue-border" data-testid="file" value="test.txt" />
        <span data-testid="ErrorMsg" id="error" class="error visible">Format incorrect</span>
        <textarea data-testid="commentary">Test Commentary</textarea>
      </form>      
    `

      document.body.innerHTML = html

      const newBill = new NewBill({
        document,
        onNavigate: mockOnNavigate,
        store: mockStore,
        mockLocalStorage,
      })

      mockStore.bills.update.mockResolvedValue({})
      const eventMock = {
        preventDefault: jest.fn(),
        target: document.querySelector('form[data-testid="form-new-bill"]'),
      }

      newBill.handleSubmit(eventMock)

      expect(eventMock.preventDefault).toHaveBeenCalledTimes(1)
      expect(screen.queryByTestId("ErrorMsg")).toHaveClass("visible")
      expect(mockStore.bills.update).not.toHaveBeenCalled()
      expect(mockOnNavigate).not.toHaveBeenCalled()
    })

    it("Capture le message si 'Erreur 404'", async () => {
      jest.spyOn(mockStore, "bills")
      jest.spyOn(console, "error")

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      )
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        mockLocalStorage,
      })

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 404"))
          },
        }
      })
      const eventMock = {
        preventDefault: jest.fn(),
        target: document.querySelector('form[data-testid="form-new-bill"]'),
      }

      newBill.handleSubmit(eventMock)
      await new Promise(process.nextTick)
      expect(eventMock.preventDefault).toHaveBeenCalledTimes(1)
      expect(console.error).toHaveBeenCalledWith(new Error("Erreur 404"))
    })

    it("Capture le message si 'Erreur 500'", async () => {
      jest.spyOn(mockStore, "bills")
      jest.spyOn(console, "error")

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      )
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        mockLocalStorage,
      })

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"))
          },
        }
      })
      const eventMock = {
        preventDefault: jest.fn(),
        target: document.querySelector('form[data-testid="form-new-bill"]'),
      }

      newBill.handleSubmit(eventMock)
      await new Promise(process.nextTick)
      expect(eventMock.preventDefault).toHaveBeenCalledTimes(1)
      expect(console.error).toHaveBeenCalledWith(new Error("Erreur 500"))
    })
  })
})
