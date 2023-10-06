/**
 * @jest-environment jsdom
 */

import {
  fireEvent,
  getAllByTestId,
  screen,
  waitFor,
} from "@testing-library/dom"
import "@testing-library/jest-dom"
import BillsUI from "../views/BillsUI.js"
// import NewBilsUI from '../views/NewBillUI.js'
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { storeMock } from "../__mocks__/store.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

import { getByTestId } from "@testing-library/dom"

import userEvent from "@testing-library/user-event"

import router from "../app/Router.js"
import NewBillUI from "../views/NewBillUI.js"
import Bills from "../containers/Bills.js"

const clickNewBill = require("../containers/Bills.js")

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
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
        const mockedClickNewBill = jest.fn((e) => NewBill.handleClickNewBill(e))
        // j'attache eventListener au bouton
        bouton.addEventListener("click", mockedClickNewBill)
        // Je simule le clic sur ce bouton
        userEvent.click(bouton)
        expect(mockedClickNewBill).toHaveBeenCalled()
      })
    })

    describe('Quand je clique sur une icône "oeil"', () => {
      it("une fenêtre modale s'affiche", async () => {
        const NewBill = new Bills({
          document,
          onNavigate,
          storeMock,
          localStorageMock,
        })
        document.body.innerHTML = BillsUI({ data: bills })
        const icon = getAllByTestId(document.body, "icon-eye")
        $.fn.modal = jest.fn() // <== ??????
        const mockedClickIcon = jest.fn(() =>
          NewBill.handleClickIconEye(icon[0])
        )
        icon[0].addEventListener("click", mockedClickIcon)
        userEvent.click(icon[0])
        await waitFor(() =>
          expect(getByTestId(document.body, "modale")).toHaveClass("show")
        )
        console.log(document.body)
      })
    })
  })
})
