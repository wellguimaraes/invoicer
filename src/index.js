import ReactDOM from "react-dom";
import React from "react";
import { formatDateRange } from "format-date-range.git";
import { eachDayOfInterval, isValid, isWeekend } from "date-fns";
import "./index.css";

function money(v) {
  return v.toLocaleString("en-US", {
    currency: "USD",
    currencyDisplay: "symbol",
    style: "currency"
  });
}

function parseDate(d) {
  const parsed = new Date(d + "T23:59:59.000Z")
  return Number.isNaN(parsed.getDate()) ? new Date('1970-01-01') : parsed
}

function _eachDayOfInterval(d1, d2) {
  try {
    return eachDayOfInterval(d1, d2)
  } catch (err) {
    return []
  }
}

const configObj = window.localStorage.getItem("config")
  ? JSON.parse(window.localStorage.getItem("config"))
  : {
      invoiceNumber: 1,
      invoicedCompany: ["Acme, Inc.", "invoices@acme.com"],
      dueDate: "2021-01-22",
      startDate: "2021-01-01",
      endDate: "2021-01-15",
      myCompany: [
        "My Tech Company Ltda",
        "CNPJ: 00.000.000/0000-00",
        "Avenida Dom Pedro II, 1234, Sala 123 B",
        "Florianópolis, SC, Brazil",
        "talkto@mytechcompany.com",
        "+55 48 999999999"
      ],
      paymentItems: [
        {
          title: "Software Development %dateRange%",
          unitPrice: 1
        },
        {
          title: "Banking fee",
          unitPrice: 20,
          quantity: 1
        }
      ],
      paymentInstructions: [
        {
          title: "Field 56A (Intermediary Bank)",
          content: [
            "THE BANK OF NEW YORK MELLON",
            "ADDRESS: 240 GREENWICH STREET NEW YORK, NY 10286",
            "SWIFT CODE: IRVTUS3N",
            "ROUTING NUMBER / ABA: 0210-0001-8"
          ]
        },
        {
          title: "Field 57A (Final Bank)",
          content: [
            "BANCO ABC S.A.",
            "ADDRESS: Lorem Ipsum Dolor Sit Amet",
            "SWIFT CODE: AAAAAAAA",
            "ACCOUNT NUMBER: 999999999"
          ]
        },
        {
          title: "Field 59 (Beneficiary)",
          content: [
            "MY TECH COMPANY LTDA",
            "IBAN: BR00 0000 0000 0000 0000 0000 000B 0"
          ]
        },
        {
          title: "Field 70 (Reference)",
          content: ["CNPJ: 00.000.000/0000-00"]
        }
      ]
    };

function LabeledInfo({ children }) {
  const [label, value] = `${children}`.trim().split(":");

  return (
    <div>
      {value ? (
        <>
          <strong>{label}:</strong> {value}
        </>
      ) : (
        label
      )}
    </div>
  );
}

function App() {
  const [config, setConfig] = React.useState(configObj);
  const [rawConfig, setRawConfig] = React.useState(
    JSON.stringify(configObj, null, "  ")
  );

  const {
    myCompany,
    dueDate: _dueDate,
    startDate: _startDate,
    endDate: _endDate,
    invoiceNumber,
    invoicedCompany,
    paymentItems: _paymentItems,
    paymentInstructions
  } = config;

  const dueDate = parseDate(_dueDate)
  const startDate = parseDate(_startDate);
  const endDate = parseDate(_endDate);

  const paymentItems = _paymentItems.map((it) => ({
    ...it,
    title: `${it.title}`.replace(
      /%dateRange%/g,
      formatDateRange(startDate, endDate)
    ),
    quantity:
      /%dateRange%/.test(it.title) && isValid(startDate) && isValid(endDate)
        ? _eachDayOfInterval({ start: startDate, end: endDate }).filter(
            (it) => !isWeekend(it)
          ).length * 8
        : it.quantity
  }));

  const [myCompanyName, ...myCompanyExtraInfo] = myCompany;

  document.title = `Invoice #${invoiceNumber}`;

  return (
    <div className="App">
      <div className="header">
        <div className="row">
          <div>
            <div>
              <h2>{myCompanyName}</h2>
              {myCompanyExtraInfo.map((it) => (
                <LabeledInfo key={it}>{it}</LabeledInfo>
              ))}
            </div>
            <div>
              <h3>Billed to</h3>
              {invoicedCompany.map((it) => (
                <LabeledInfo key={it}>{it}</LabeledInfo>
              ))}
            </div>
          </div>
          <div>
            <h2>Invoice #{invoiceNumber}</h2>
            <div>
              {isValid(endDate) &&
                endDate.toString().match(/[a-z]{3} \d{2} \d{4}/i)[0]}
            </div>
            {isValid(dueDate) && <div><strong>Due Date:</strong> {dueDate?.toString().match(/[a-z]{3} \d{2} \d{4}/i)[0]}</div>}
          </div>
        </div>
      </div>
      <div className="content">
        <table cellPadding={0} cellSpacing={10}>
          <thead>
            <tr>
              <td>#</td>
              <td>Item description</td>
              <td width="10%">Price</td>
              <td width="12%">Quantity</td>
              <td width="15%">Subtotal</td>
            </tr>
          </thead>
          <tbody>
            {paymentItems.map((it, i) => {
              return (
                <tr key={it.title}>
                  <td>{i + 1}</td>
                  <td>{it.title}</td>
                  <td>{money(it.unitPrice)}</td>
                  <td>{it.quantity}</td>
                  <td>{money(it.unitPrice * it.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>Total</td>
              <td>
                {money(
                  paymentItems.reduce(
                    (acc, curr) => acc + curr.unitPrice * curr.quantity,
                    0
                  )
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="footer">
        <h3>Payment Instructions</h3>
        <div>
          {paymentInstructions.map(({ title, content }, i) => (
            <div key={title || i}>
              {title && <strong>{title}:</strong>}
              <div
                style={{
                  fontSize: ".8em",
                  paddingLeft: title ? 20 : 0,
                  marginBottom: 20
                }}
              >
                {content.map((it) => (
                  <LabeledInfo key={it}>{it}</LabeledInfo>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <textarea
        onChange={(e) => {
          const v = e.target.value;
          try {
            const newConfig = JSON.parse(v);
            setConfig(newConfig);
            window.localStorage.setItem("config", v);
          } catch {}
          setRawConfig(e.target.value);
        }}
        value={rawConfig}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
