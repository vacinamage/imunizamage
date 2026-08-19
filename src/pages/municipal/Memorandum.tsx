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

  /*
   * Se já estiver no formato brasileiro,
   * mantém como está.
   */
  if (
    value.includes('/')
  ) {
    return value.split(',')[0];
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

  return date.toLocaleDateString(
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

  /*
   * Se veio da tela de autorização,
   * usamos os itens analisados.
   *
   * Caso contrário, usamos os itens
   * originais da solicitação como fallback.
   */
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
     GERAR LINHAS PARA IMPRESSÃO
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
        /*
         * Se a vacina saiu de mais de um lote,
         * cria uma linha para cada lote.
         */
        if (
          item.lotAllocations &&
          item.lotAllocations
            .length > 0
        ) {
          item.lotAllocations.forEach(
            (
              allocation,
              allocationIndex
            ) => {
              rows.push({
                id: `${item.id}-${allocation.lotId}-${allocationIndex}`,

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

        /*
         * Compatibilidade com versões
         * anteriores onde havia um lote único.
         */
        rows.push({
          id: item.id,

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
     DIVISÃO DAS TABELAS
  ======================================================= */

  /*
   * Até 10 linhas:
   * tabela única.
   *
   * Acima de 10:
   * divide a lista ao meio
   * e mostra lado a lado.
   */
  const splitTable =
    rows.length > 10;

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
    <table className="memorandum-table w-full border-collapse">

      <thead>

        <tr>

          <th>
            VACINA
          </th>

          <th className="memorandum-lot">
            LOTE
          </th>

          <th className="memorandum-dose">
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
     SEM SOLICITAÇÃO
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

  return (
    <div className="mx-auto max-w-[1200px]">

      {/* =====================================================
          BOTÕES DA TELA
      ===================================================== */}

      <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-3xl font-black text-slate-900">
            Memorando
          </h1>

          <p className="mt-1 text-slate-500">
            Visualização para impressão.
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

          Imprimir memorando
        </Button>

      </div>

      {/* =====================================================
          DOCUMENTO
      ===================================================== */}

      <div
        id="memorandum-print"
        className="memorandum-page bg-white text-black shadow-sm"
      >

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

          <div className="memorandum-icon">

            <FileText
              size={26}
            />

          </div>

        </div>

        {/* TÍTULO */}

        <div className="memorandum-title">

          <h2>
            MEMORANDO
          </h2>

          <strong>
            {
              memorandumNumber
            }
          </strong>

        </div>

        {/* DADOS */}

        <div className="memorandum-info">

          <div>

            <span>
              UNIDADE
            </span>

            <strong>
              {
                request.unitName
              }
            </strong>

          </div>

          <div>

            <span>
              SOLICITAÇÃO
            </span>

            <strong>
              {
                request.protocol
              }
            </strong>

          </div>

          <div>

            <span>
              DATA
            </span>

            <strong>
              {formatDate(
                request.createdAt
              )}
            </strong>

          </div>

        </div>

        {/* TEXTO */}

        <p className="memorandum-text">
          Encaminhamos abaixo os imunobiológicos autorizados para atendimento da solicitação da unidade.
        </p>

        {/* =================================================
            TABELAS
        ================================================= */}

        {!splitTable ? (
          <div className="memorandum-single-table">

            {renderTable(
              leftRows
            )}

          </div>
        ) : (
          <div className="memorandum-double-table">

            <div className="memorandum-table-column">

              {renderTable(
                leftRows
              )}

            </div>

            <div className="memorandum-table-column">

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

        {/* OBSERVAÇÃO */}

        <div className="memorandum-note">

          <strong>
            Observação:
          </strong>{' '}

          os lotes são selecionados automaticamente pelo sistema, priorizando os imunobiológicos válidos com vencimento mais próximo.

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

            <p className="signature-date">
              Data: ______ / ______ / ______
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

            <p className="signature-date">
              Data: ______ / ______ / ______
            </p>

          </div>

        </div>

        {/* RODAPÉ */}

        <div className="memorandum-footer">

          <span>
            IMUNIZA PLUS
          </span>

          <span>
            {
              request.protocol
            }
          </span>

          <span>
            Página 1 de 1
          </span>

        </div>

      </div>

      {/* =====================================================
          CSS DO MEMORANDO
      ===================================================== */}

      <style>
        {`

        .memorandum-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 10mm 11mm 8mm;
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
        }

        .memorandum-header {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr;
          align-items: center;
          border-bottom: 2px solid #1e3a8a;
          padding-bottom: 7px;
        }

        .memorandum-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .memorandum-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          font-size: 25px;
          font-weight: 800;
          line-height: 1;
        }

        .memorandum-logo-main {
          color: #2563eb;
          font-size: 15px;
          line-height: 1;
          font-weight: 900;
        }

        .memorandum-logo-plus {
          color: #38bdf8;
          margin-top: 2px;
          font-size: 10px;
          letter-spacing: 2px;
          font-weight: 800;
        }

        .memorandum-header-center {
          text-align: center;
        }

        .memorandum-header-center h1 {
          margin: 0;
          font-size: 12px;
          font-weight: 800;
        }

        .memorandum-header-center p {
          margin: 3px 0 0;
          font-size: 7.5px;
          font-weight: 600;
          letter-spacing: .7px;
        }

        .memorandum-icon {
          display: flex;
          justify-content: flex-end;
          color: #2563eb;
        }

        .memorandum-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding: 7px 10px;
          border-radius: 5px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }

        .memorandum-title h2 {
          margin: 0;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .memorandum-title strong {
          font-size: 10px;
          color: #1d4ed8;
        }

        .memorandum-info {
          display: grid;
          grid-template-columns: 2fr 1.25fr .8fr;
          gap: 5px;
          margin-top: 7px;
        }

        .memorandum-info > div {
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 5px 7px;
        }

        .memorandum-info span {
          display: block;
          color: #6b7280;
          font-size: 6.5px;
          font-weight: 800;
          letter-spacing: .5px;
        }

        .memorandum-info strong {
          display: block;
          margin-top: 2px;
          font-size: 8.5px;
          line-height: 1.2;
        }

        .memorandum-text {
          margin: 7px 0;
          font-size: 8px;
          line-height: 1.3;
        }

        .memorandum-single-table {
          width: 100%;
        }

        .memorandum-double-table {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          align-items: start;
        }

        .memorandum-table-column {
          min-width: 0;
        }

        .memorandum-table {
          table-layout: fixed;
          font-size: 7.5px;
        }

        .memorandum-table th {
          padding: 4px 4px;
          border: 1px solid #9ca3af;
          background: #e5e7eb;
          font-size: 6.8px;
          font-weight: 900;
          text-align: left;
        }

        .memorandum-table td {
          height: 18px;
          padding: 3px 4px;
          border: 1px solid #cbd5e1;
          line-height: 1.15;
          vertical-align: middle;
          overflow-wrap: anywhere;
        }

        .memorandum-table th:first-child {
          width: auto;
        }

        .memorandum-lot {
          width: 29%;
          text-align: center !important;
        }

        .memorandum-dose {
          width: 17%;
          text-align: center !important;
        }

        .memorandum-total {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          margin-top: 6px;
          border-top: 1px solid #d1d5db;
          padding-top: 5px;
        }

        .memorandum-total span {
          font-size: 7px;
          font-weight: 800;
          color: #6b7280;
        }

        .memorandum-total strong {
          font-size: 10px;
          color: #1d4ed8;
        }

        .memorandum-note {
          margin-top: 6px;
          padding: 5px 7px;
          border-radius: 4px;
          background: #f8fafc;
          font-size: 7px;
          line-height: 1.25;
          color: #475569;
        }

        .memorandum-signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25mm;
          margin-top: 15mm;
          padding: 0 10mm;
        }

        .signature-block {
          text-align: center;
        }

        .signature-line {
          border-top: 1px solid #111827;
          margin-bottom: 5px;
        }

        .signature-block strong {
          display: block;
          font-size: 7.5px;
        }

        .signature-block p {
          margin: 3px 0 0;
          font-size: 6.5px;
          color: #6b7280;
        }

        .signature-date {
          margin-top: 6px !important;
        }

        .memorandum-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 9mm;
          border-top: 1px solid #e5e7eb;
          padding-top: 4px;
          color: #94a3b8;
          font-size: 6px;
          font-weight: 600;
        }

        @media print {

          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            width: 210mm;
            height: 297mm;
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
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 8mm 10mm 6mm !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }

          .no-print {
            display: none !important;
          }

          .memorandum-table tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .memorandum-signatures {
            break-inside: avoid;
            page-break-inside: avoid;
          }

        }

        `}
      </style>

    </div>
  );
};