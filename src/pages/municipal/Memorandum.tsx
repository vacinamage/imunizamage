import {
  FileText,
  Printer,
} from 'lucide-react';

import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  Button,
  Card,
} from '../../components/ui';

import {
  getRequestByProtocol,
} from '../../data/mockRequests';

/* =========================================================
   TIPOS
========================================================= */

type LotAllocation = {
  lotId: string;
  lotNumber: string;
  expirationDate: string;
  doses: number;
};

type MemorandumItem = {
  id: string;
  vaccineId?: string;
  vaccineName: string;
  requestedQuantity?: number;
  authorizedQuantity: number;
  addedByCentral?: boolean;
  lotNumber?: string;
  lotAllocations?: LotAllocation[];
};

type MemorandumState = {
  memorandumNumber?: string;
  analyzedItems?: MemorandumItem[];
};

type PrintRow = {
  id: string;
  vaccineName: string;
  lotNumber: string;
  doses: number;
};

/* =========================================================
   FUNÇÕES
========================================================= */

const formatDate = (
  value?: string
) => {
  if (!value) {
    return new Date().toLocaleDateString(
      'pt-BR'
    );
  }

  if (
    value.includes('/')
  ) {
    return value;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    'pt-BR'
  );
};

/* =========================================================
   COMPONENTE
========================================================= */

export const Memorandum = () => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    protocol = '',
  } = useParams();

  const request =
    getRequestByProtocol(
      protocol
    );

  const state =
    (location.state ||
      {}) as MemorandumState;

  const memorandumNumber =
    state.memorandumNumber ||
    `MEM-${new Date().getFullYear()}-${protocol
      .replace(/\D/g, '')
      .slice(-6)
      .padStart(6, '0')}`;

  /* =======================================================
     ITENS
  ======================================================= */

  const items:
    MemorandumItem[] =
    state.analyzedItems &&
    state.analyzedItems.length >
      0
      ? state.analyzedItems
      : request?.items.map(
          (item) => ({
            id: item.id,

            vaccineId:
              item.vaccineId,

            vaccineName:
              item.vaccineName,

            requestedQuantity:
              item.requestedQuantity,

            authorizedQuantity:
              item.requestedQuantity,

            lotAllocations: [],
          })
        ) ?? [];

  /* =======================================================
     LINHAS DE IMPRESSÃO
  ======================================================= */

  const rows:
    PrintRow[] = [];

  items
    .filter(
      (item) =>
        item.authorizedQuantity >
        0
    )
    .forEach(
      (item) => {
        if (
          item.lotAllocations &&
          item.lotAllocations
            .length > 0
        ) {
          item.lotAllocations.forEach(
            (
              allocation,
              index
            ) => {
              rows.push({
                id: `${item.id}-${allocation.lotId}-${index}`,

                vaccineName:
                  item.vaccineName,

                lotNumber:
                  allocation.lotNumber,

                doses:
                  allocation.doses,
              });
            }
          );

          return;
        }

        rows.push({
          id:
            item.id,

          vaccineName:
            item.vaccineName,

          lotNumber:
            item.lotNumber ||
            '-',

          doses:
            item.authorizedQuantity,
        });
      }
    );

  /* =======================================================
     DIVISÃO DA TABELA
  ======================================================= */

  const splitTable =
    rows.length > 8;

  const middleIndex =
    Math.ceil(
      rows.length / 2
    );

  const leftRows =
    splitTable
      ? rows.slice(
          0,
          middleIndex
        )
      : rows;

  const rightRows =
    splitTable
      ? rows.slice(
          middleIndex
        )
      : [];

  const totalDoses =
    rows.reduce(
      (
        total,
        row
      ) =>
        total +
        row.doses,
      0
    );

  /* =======================================================
     TABELA
  ======================================================= */

  const renderTable = (
    tableRows:
      PrintRow[]
  ) => (
    <table className="memorandum-table">

      <thead>

        <tr>

          <th>
            VACINA
          </th>

          <th className="lot-column">
            LOTE
          </th>

          <th className="dose-column">
            DOSES
          </th>

        </tr>

      </thead>

      <tbody>

        {tableRows.map(
          (row) => (
            <tr
              key={
                row.id
              }
            >

              <td>
                {
                  row.vaccineName
                }
              </td>

              <td className="text-center">
                {
                  row.lotNumber
                }
              </td>

              <td className="text-center font-bold">
                {
                  row.doses
                }
              </td>

            </tr>
          )
        )}

      </tbody>

    </table>
  );

  /* =======================================================
     VIA DO MEMORANDO
  ======================================================= */

  const renderMemorandumCopy = (
    copyLabel: string
  ) => (
    <section className="memorandum-copy">

      {/* VIA */}

      <div className="copy-label">
        {copyLabel}
      </div>

      {/* CABEÇALHO */}

      <div className="memorandum-header">

        <div className="memorandum-logo">

          <div className="memorandum-logo-icon">
            +
          </div>

          <div>

            <div className="memorandum-logo-main">
              IMUNIZA
            </div>

            <div className="memorandum-logo-plus">
              PLUS
            </div>

          </div>

        </div>

        <div className="memorandum-header-center">

          <h1>
            CENTRAL DE IMUNIZAÇÃO
          </h1>

          <p>
            DISTRIBUIÇÃO DE IMUNOBIOLÓGICOS
          </p>

        </div>

        <div className="memorandum-document-icon">

          <FileText
            size={20}
          />

        </div>

      </div>

      {/* MEMORANDO */}

      <div className="memorandum-title">

        <strong>
          MEMORANDO
        </strong>

        <span>
          {
            memorandumNumber
          }
        </span>

      </div>

      {/* DADOS */}

      <div className="memorandum-info">

        <div>

          <span>
            UNIDADE
          </span>

          <strong>
            {
              request?.unitName
            }
          </strong>

        </div>

        <div>

          <span>
            SOLICITAÇÃO
          </span>

          <strong>
            {
              request?.protocol
            }
          </strong>

        </div>

        <div>

          <span>
            DATA
          </span>

          <strong>
            {formatDate(
              request?.createdAt
            )}
          </strong>

        </div>

      </div>

      {/* TEXTO */}

      <p className="memorandum-text">
        Encaminhamos abaixo os imunobiológicos autorizados para atendimento da solicitação da unidade.
      </p>

      {/* TABELAS */}

      {!splitTable ? (
        <div className="single-table">

          {renderTable(
            leftRows
          )}

        </div>
      ) : (
        <div className="double-table">

          <div>

            {renderTable(
              leftRows
            )}

          </div>

          <div>

            {renderTable(
              rightRows
            )}

          </div>

        </div>
      )}

      {/* TOTAL */}

      <div className="memorandum-total">

        <span>
          TOTAL LIBERADO
        </span>

        <strong>
          {totalDoses.toLocaleString(
            'pt-BR'
          )}{' '}
          DOSES
        </strong>

      </div>

      {/* ASSINATURAS */}

      <div className="memorandum-signatures">

        <div className="signature-block">

          <div className="signature-line" />

          <strong>
            RECEBIDO PELA UNIDADE
          </strong>

          <p>
            Nome / assinatura
          </p>

          <p>
            Data: _____ / _____ / ______
          </p>

        </div>

        <div className="signature-block">

          <div className="signature-line" />

          <strong>
            CENTRAL DE IMUNIZAÇÃO
          </strong>

          <p>
            Responsável pela liberação
          </p>

          <p>
            Data: _____ / _____ / ______
          </p>

        </div>

      </div>

    </section>
  );

  /* =======================================================
     SOLICITAÇÃO NÃO ENCONTRADA
  ======================================================= */

  if (!request) {
    return (
      <Card className="mx-auto max-w-2xl rounded-3xl p-8">

        <h1 className="text-2xl font-black">
          Memorando não encontrado
        </h1>

        <p className="mt-2 text-slate-500">
          Não foi possível localizar a solicitação relacionada a este memorando.
        </p>

        <Button
          className="mt-6"
          onClick={() =>
            navigate(
              '/app/solicitacoes'
            )
          }
        >
          Voltar às solicitações
        </Button>

      </Card>
    );
  }

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="mx-auto max-w-[1200px]">

      {/* BOTÃO */}

      <div className="no-print mb-6 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black text-slate-900">
            Memorando
          </h1>

          <p className="mt-1 text-slate-500">
            Duas vias em uma única folha A4.
          </p>

        </div>

        <Button
          onClick={() =>
            window.print()
          }
        >
          <Printer
            size={17}
            className="mr-2"
          />

          Imprimir
        </Button>

      </div>

      {/* DOCUMENTO */}

      <div
        id="memorandum-print"
        className="memorandum-page"
      >

        {renderMemorandumCopy(
          '1ª VIA - UNIDADE'
        )}

        <div className="cut-line">

          <span>
            ✂ CORTE
          </span>

        </div>

        {renderMemorandumCopy(
          '2ª VIA - CENTRAL'
        )}

      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>
        {`

        .memorandum-page {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          padding: 5mm 8mm;
          box-sizing: border-box;
          background: white;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.12);
          overflow: hidden;
        }

        .memorandum-copy {
          height: 138mm;
          box-sizing: border-box;
          overflow: hidden;
        }

        .copy-label {
          height: 4mm;
          text-align: right;
          color: #64748b;
          font-size: 6px;
          line-height: 4mm;
          font-weight: 800;
        }

        .memorandum-header {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr;
          align-items: center;
          padding-bottom: 3px;
          border-bottom: 2px solid #1e3a8a;
        }

        .memorandum-logo {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .memorandum-logo-icon {
          display: flex;
          width: 25px;
          height: 25px;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background: #2563eb;
          color: white;
          font-size: 20px;
          font-weight: 900;
        }

        .memorandum-logo-main {
          color: #2563eb;
          font-size: 12px;
          font-weight: 900;
          line-height: 1;
        }

        .memorandum-logo-plus {
          margin-top: 2px;
          color: #38bdf8;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .memorandum-header-center {
          text-align: center;
        }

        .memorandum-header-center h1 {
          margin: 0;
          font-size: 9px;
          font-weight: 900;
        }

        .memorandum-header-center p {
          margin: 2px 0 0;
          font-size: 5.5px;
          font-weight: 700;
          letter-spacing: .6px;
        }

        .memorandum-document-icon {
          display: flex;
          justify-content: flex-end;
          color: #2563eb;
        }

        .memorandum-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
          padding: 3px 6px;
          border: 1px solid #bfdbfe;
          border-radius: 4px;
          background: #eff6ff;
        }

        .memorandum-title strong {
          font-size: 8px;
          letter-spacing: .6px;
        }

        .memorandum-title span {
          color: #1d4ed8;
          font-size: 7px;
          font-weight: 900;
        }

        .memorandum-info {
          display: grid;
          grid-template-columns: 2fr 1.1fr .9fr;
          gap: 4px;
          margin-top: 4px;
        }

        .memorandum-info > div {
          min-width: 0;
          padding: 3px 5px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }

        .memorandum-info span {
          display: block;
          color: #6b7280;
          font-size: 5px;
          font-weight: 900;
        }

        .memorandum-info strong {
          display: block;
          margin-top: 1px;
          overflow: hidden;
          font-size: 6.5px;
          line-height: 1.15;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .memorandum-text {
          margin: 4px 0;
          font-size: 6px;
          line-height: 1.2;
        }

        .single-table {
          width: 100%;
        }

        .double-table {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          align-items: start;
        }

        .memorandum-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 5.8px;
        }

        .memorandum-table th {
          padding: 2px 3px;
          border: 1px solid #9ca3af;
          background: #e5e7eb;
          font-size: 5px;
          font-weight: 900;
          text-align: left;
        }

        .memorandum-table td {
          height: 10px;
          padding: 1px 3px;
          border: 1px solid #cbd5e1;
          line-height: 1.1;
          vertical-align: middle;
          overflow-wrap: anywhere;
        }

        .lot-column {
          width: 29%;
          text-align: center !important;
        }

        .dose-column {
          width: 15%;
          text-align: center !important;
        }

        .memorandum-total {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 3px;
          padding-top: 2px;
          border-top: 1px solid #d1d5db;
        }

        .memorandum-total span {
          color: #64748b;
          font-size: 5.5px;
          font-weight: 900;
        }

        .memorandum-total strong {
          color: #1d4ed8;
          font-size: 7px;
        }

        .memorandum-signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18mm;
          margin-top: 8mm;
          padding: 0 7mm;
        }

        .signature-block {
          text-align: center;
        }

        .signature-line {
          margin-bottom: 3px;
          border-top: 1px solid #111827;
        }

        .signature-block strong {
          display: block;
          font-size: 5.5px;
        }

        .signature-block p {
          margin: 2px 0 0;
          color: #64748b;
          font-size: 4.8px;
        }

        .cut-line {
          position: relative;
          display: flex;
          height: 11mm;
          align-items: center;
          justify-content: center;
        }

        .cut-line::before {
          position: absolute;
          right: 0;
          left: 0;
          border-top: 1px dashed #94a3b8;
          content: '';
        }

        .cut-line span {
          position: relative;
          z-index: 1;
          padding: 0 6px;
          background: white;
          color: #64748b;
          font-size: 5.5px;
          font-weight: 800;
        }

        @media print {

          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          #memorandum-print,
          #memorandum-print * {
            visibility: visible !important;
          }

          #memorandum-print {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;

            width: 210mm !important;
            height: 297mm !important;

            margin: 0 !important;
            padding: 4mm 8mm !important;

            box-shadow: none !important;

            overflow: hidden !important;
          }

          .no-print {
            display: none !important;
          }

          .memorandum-copy {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .memorandum-table tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

        }

        `}
      </style>

    </div>
  );
};