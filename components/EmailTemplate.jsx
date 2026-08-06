import * as React from "react";

export const EmailTemplate = ({ nume, email, telefon, mesaj }) => (
  <>
    <h1>Solicitare noua de oferta - Myriad</h1>
    <p>Nume complet: {nume}</p>
    <p>Email: {email}</p>
    <p>Telefon: {telefon}</p>
    <p>Mesaj: {mesaj}</p>
    <p>
      Odata cu primirea acestul email, utilizatorul a fost de acord cu GDPR-ul.
    </p>
  </>
);
