/**
 * @jest-environment jsdom
 */

import {
  getAllByTestId,
  screen,
  waitFor,
  getByTestId,
} from "@testing-library/dom"
import "@testing-library/jest-dom"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import BillsUI from "../views/BillsUI.js"

import storeMock from "../__mocks__/store.js"
import { storeVide } from "../__mocks__/store_vide.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

import userEvent from "@testing-library/user-event"

// import NewBillUI from "../views/NewBillUI.js"
import Bills from "../containers/Bills.js"

import { formatDate, formatStatus } from "../app/format.js" // 12/10

const clickNewBill = require("../containers/Bills.js")

import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Compossant BILLS", () => {
  describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
      test("Then bill icon in vertical layout should be highlighted", async () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        })
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        )
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => screen.getByTestId("icon-window"))
        const windowIcon = screen.getByTestId("icon-window")
        //to-do write expect expression
        expect(windowIcon).toHaveClass("active-icon")
      })
      test("Then bills should be ordered from earliest to latest", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const dates = screen
          .getAllByText(
            /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
          )
          .map((a) => a.innerHTML)
        const antiChrono = (a, b) => (a < b ? 1 : -1)
        const datesSorted = [...dates].sort(antiChrono)
        expect(dates).toEqual(datesSorted)
      })

      describe('Quand je clique sur le bouton "Nouvelle note de frais', () => {
        it("la fonction 'handleClickNewBill' est appelée", () => {
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          // je génère la page Bills avec les données mockées
          const NewBill = new Bills({
            document,
            onNavigate,
            storeMock,
            localStorageMock,
          })
          // je récupère le bouton "Nouvelle note de frais" par son data-testid
          const bouton = getByTestId(document.body, "btn-new-bill")
          const mockedClickNewBill = jest.fn((e) =>
            NewBill.handleClickNewBill(e)
          )
          // j'attache eventListener au bouton
          bouton.addEventListener("click", mockedClickNewBill)
          // Je simule le clic sur ce bouton
          userEvent.click(bouton)
          expect(mockedClickNewBill).toHaveBeenCalled()
        })
      })

      describe('Quand je clique sur une icône "oeil"', () => {
        it("la fonction handleClickIconEYe est appelée et une fenêtre modale s'affiche", () => {
          const NewBill = new Bills({
            document,
            onNavigate,
            storeMock,
            localStorageMock,
          })
          document.body.innerHTML = BillsUI({ data: bills })
          const icons = getAllByTestId(document.body, "icon-eye")
          $.fn.modal = jest.fn()
          icons.forEach((icon) => {
            const mockedClickIcon = jest.fn(() =>
              NewBill.handleClickIconEye(icon)
            )
            icon.addEventListener("click", mockedClickIcon)
            userEvent.click(icon)
            waitFor(() =>
              expect(getByTestId(document.body, "modale")).toHaveClass("show")
            )
            expect(mockedClickIcon).toHaveBeenCalled()
          })
        })
      })

      describe("Quand je n'ai aucune facture", () => {
        it("la page s'affiche avec un tableau vide", () => {
          const NewBill = new Bills({
            document,
            onNavigate,
            storeVide,
            localStorageMock,
          })
          document.body.innerHTML = BillsUI({ NewBill })
          const billsArray = screen.getByTestId("tbody").innerText
          expect(document.body).toHaveTextContent("Mes notes de frais")
          expect(billsArray).toBeFalsy()
        })
      })

      it("Les dates sont correctement formatées", () => {
        const inputDate = "2023-09-07"
        const expectedDate = "7 Sep. 23"
        const result = formatDate(inputDate)
        expect(result).toBe(expectedDate)
      })

      it("Les status sont corrects", () => {
        const input1 = "pending"
        const expected1 = "En attente"
        const result1 = formatStatus(input1)
        expect(result1).toBe(expected1)

        const input2 = "accepted"
        const expected2 = "Accepté"
        const result2 = formatStatus(input2)
        expect(result2).toBe(expected2)

        const input3 = "refused"
        const expected3 = "Refusé"
        const result3 = formatStatus(input3)
        expect(result3).toBe(expected3)
      })
    })
  })

  describe("Je suis un utilisateur connecté comme Employee", () => {
    describe("Quand j'affiche la page Bills", () => {
      test("La page 'Mes notes de frais' est affichée", async () => {
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        )
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => screen.getByText("Mes notes de frais"))
      })
    })
  })
  describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
      test("fetches bills from mock API GET", async () => {
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        )
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => screen.getByText("Mes notes de frais"))
        const note = screen.getByText("Mes notes de frais")
        expect(note).toBeTruthy()
      })
      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
          })
          window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Employee",
              email: "a@a",
            })
          )
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()
        })
        test("fetches bills from an API and fails with 404 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 404"))
              },
            }
          })
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick)
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })

        test("fetches messages from an API and fails with 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 500"))
              },
            }
          })

          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick)
          const message = await screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
      })
    })
  })
})
