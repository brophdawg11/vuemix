describe('Vuemix', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
  });

  it("properly SSR's the loader data and hydrates the button", () => {
    cy.contains('Welcome to Vuemix!');
    cy.get('[data-testid="increment-button"]')
      .should('exist')
      .then((btn) => {
        // Ensure we SSR the loader random number
        const getNum = () =>
          parseInt(btn.text().match(/Increment (\d{1,3})/)[1], 10);
        const num = getNum();
        // Ensure we increment (hydration suceeded)
        cy.get(btn)
          .click()
          .click()
          .click()
          .then(() => expect(getNum()).to.equal(num + 3));
      });
  });

  it('Submits the form to the action', () => {
    // Submit the text form and confirm the aciton updates
    cy.get('[data-testid="text-input"]')
      .type('hello world')
      .parent()
      .find('button')
      .click()
      .then((btn) => {
        cy.get(btn)
          .parent()
          .contains(/hello world-\d{1,2}/);
      });
  });
});
