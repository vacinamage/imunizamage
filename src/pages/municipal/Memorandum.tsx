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
   FORMATAÇÃO DA DATA
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
   * Se já estiver em formato brasileiro,
   * mantém somente data/hora recebida.
   */
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

  /* =======================================================
     NÚMERO DO MEMORANDO
  ======================================================= */

  const memorandumNumber =
    state.memorandumNumber ||
    `MEM-${new Date().getFullYear()}-${protocol
      .replace(/\D/g, '')
      .slice(-6)
      .padStart(6, '0')}`;

  /* =======================================================
     ITENS AUTORIZADOS
  ======================================================= */

  const items:
    MemorandumItem[] =
    state.analyzedItems &&
    state.analyzedItems.length >
      0
      ? state.analyzedItems
      : request?.items.map(
          (item) => ({
            id:
              item.id,

            vaccineId:
              item.vaccineId,

            vaccineName:
              item.vaccineName,

            requestedQuantity:
              item.requestedQuantity,

            authorizedQuantity:
              item.requestedQuantity,

            lotAllocations:
              [],
          })
        ) ?? [];

  /* =======================================================
     GERAR LINHAS DA TABELA
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
         * Quando a vacina saiu de
         * mais de um lote, cada lote
         * aparece em uma linha.
         */
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
                id:
                  `${item.id}-${allocation.lotId}-${index}`,

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
         * Compatibilidade com pedidos
         * antigos.
         */
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
     DIVIDIR A TABELA
  ======================================================= */

  /*
   * Com mais de 7 linhas,
   * divide automaticamente
   * em duas tabelas lado a lado.
   */
  const splitTable =
    rows.length > 7;

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

  /*
   * Se houver muitos lotes,
   * ativa compactação apenas
   * na tabela.
   */
  const compactTable =
    rows.length > 14;

  const veryCompactTable =
    rows.length > 20;

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
     RENDERIZAR TABELA
  ======================================================= */

  const renderTable = (
    tableRows:
      PrintRow[]
  ) => (
    <table
      className={`memorandum-table ${
        compactTable
          ? 'compact-table'
          : ''
      } ${
        veryCompactTable
          ? 'very-compact-table'
          : ''
      }`}
    >

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

              <td className="table-center">
                {
                  row.lotNumber
                }
              </td>

              <td className="table-center table-dose">
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
     UMA VIA DO MEMORANDO
  ======================================================= */

  const renderMemorandumCopy = (
    copyLabel: string
  ) => (
    <section className="memorandum-copy">

      {/* IDENTIFICAÇÃO DA VIA */}

      <div className="copy-label">
        {
          copyLabel
        }
      </div>

      {/* CABEÇALHO */}

      <div className="memorandum-header">

        {/* LOGO */}

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

        {/* CENTRAL */}

        <div className="memorandum-header-center">

          <h1>
            CENTRAL DE IMUNIZAÇÃO
          </h1>

          <p>
            DISTRIBUIÇÃO DE IMUNOBIOLÓGICOS
          </p>

        </div>

        {/* ÍCONE */}

        <div className="memorandum-document-icon">

          <FileText
            size={24}
          />

        </div>

      </div>

      {/* TÍTULO */}

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

      {/* TABELA */}

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

          <p className="signature-date">
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

          <p className="signature-date">
            Data: _____ / _____ / ______
          </p>

        </div>

      </div>

    </section>
  );

  /* =======================================================
     NÃO ENCONTRADO
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
     TELA
  ========================================================= */

  return (
    <div className="mx-auto max-w-[1200px]">

      {/* ÁREA FORA DA IMPRESSÃO */}

      <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

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
            size={18}
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
        className="memorandum-page"
      >

        {/* PRIMEIRA VIA */}

        {renderMemorandumCopy(
          '1ª VIA - UNIDADE'
        )}

        {/* CORTE */}

        <div className="cut-line">

          <span>
            ✂ CORTE
          </span>

        </div>

        {/* SEGUNDA VIA */}

        {renderMemorandumCopy(
          '2ª VIA - CENTRAL'
        )}

      </div>

      {/* =====================================================
          ESTILOS
      ===================================================== */}

      <style>
        {`

        /* ===================================================
           PÁGINA A4
        =================================================== */

        .memorandum-page {
          width: 210mm;
          height: 297mm;

          margin: 0 auto;

          padding: 4mm 7mm;

          box-sizing: border-box;

          overflow: hidden;

          background: white;
          color: #0f172a;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          box-shadow:
            0 2px 8px
            rgba(15, 23, 42, 0.12);
        }

        /* ===================================================
           CADA VIA
        =================================================== */

        .memorandum-copy {
          height: 139mm;

          box-sizing: border-box;

          overflow: hidden;
        }

        /* ===================================================
           IDENTIFICAÇÃO DA VIA
        =================================================== */

        .copy-label {
          height: 5mm;

          text-align: right;

          color: #475569;

          font-size: 8px;

          line-height: 5mm;

          font-weight: 900;

          letter-spacing: .4px;
        }

        /* ===================================================
           CABEÇALHO
        =================================================== */

        .memorandum-header {
          display: grid;

          grid-template-columns:
            1fr
            1.7fr
            1fr;

          align-items: center;

          padding-bottom: 5px;

          border-bottom:
            2px solid
            #1e3a8a;
        }

        /* ===================================================
           LOGO
        =================================================== */

        .memorandum-logo {
          display: flex;

          align-items: center;

          gap: 7px;
        }

        .memorandum-logo-icon {
          display: flex;

          width: 30px;
          height: 30px;

          align-items: center;
          justify-content: center;

          border-radius: 7px;

          background:
            #2563eb;

          color: white;

          font-size: 24px;

          font-weight: 900;

          line-height: 1;
        }

        .memorandum-logo-main {
          color:
            #2563eb;

          font-size: 15px;

          font-weight: 900;

          line-height: 1;
        }

        .memorandum-logo-plus {
          margin-top: 3px;

          color:
            #38bdf8;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 2px;
        }

        /* ===================================================
           CABEÇALHO CENTRAL
        =================================================== */

        .memorandum-header-center {
          text-align: center;
        }

        .memorandum-header-center h1 {
          margin: 0;

          font-size: 12px;

          font-weight: 900;
        }

        .memorandum-header-center p {
          margin: 3px 0 0;

          font-size: 7px;

          font-weight: 700;

          letter-spacing: .7px;
        }

        .memorandum-document-icon {
          display: flex;

          justify-content: flex-end;

          color:
            #2563eb;
        }

        /* ===================================================
           TÍTULO
        =================================================== */

        .memorandum-title {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          margin-top: 5px;

          padding:
            5px 8px;

          border:
            1px solid
            #bfdbfe;

          border-radius:
            5px;

          background:
            #eff6ff;
        }

        .memorandum-title strong {
          font-size: 11px;

          letter-spacing:
            .7px;
        }

        .memorandum-title span {
          color:
            #1d4ed8;

          font-size: 10px;

          font-weight: 900;
        }

        /* ===================================================
           INFORMAÇÕES
        =================================================== */

        .memorandum-info {
          display: grid;

          grid-template-columns:
            2fr
            1.15fr
            1fr;

          gap: 5px;

          margin-top: 5px;
        }

        .memorandum-info > div {
          min-width: 0;

          padding:
            4px 6px;

          border:
            1px solid
            #cbd5e1;

          border-radius:
            4px;
        }

        .memorandum-info span {
          display: block;

          color:
            #64748b;

          font-size: 7px;

          font-weight: 900;

          letter-spacing:
            .3px;
        }

        .memorandum-info strong {
          display: block;

          margin-top: 2px;

          overflow: hidden;

          color:
            #0f172a;

          font-size: 9px;

          line-height: 1.2;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }

        /* ===================================================
           TEXTO
        =================================================== */

        .memorandum-text {
          margin:
            5px 0;

          color:
            #334155;

          font-size: 8.5px;

          line-height: 1.35;
        }

        /* ===================================================
           TABELA
        =================================================== */

        .single-table {
          width: 100%;
        }

        .double-table {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 6px;

          align-items: start;
        }

        .memorandum-table {
          width: 100%;

          table-layout:
            fixed;

          border-collapse:
            collapse;

          font-size: 8.5px;
        }

        .memorandum-table th {
          padding:
            4px 5px;

          border:
            1px solid
            #94a3b8;

          background:
            #e2e8f0;

          color:
            #1e293b;

          font-size: 8px;

          font-weight: 900;

          text-align: left;
        }

        .memorandum-table td {
          height: 18px;

          padding:
            3px 5px;

          border:
            1px solid
            #cbd5e1;

          color:
            #0f172a;

          font-size: 8.5px;

          font-weight: 500;

          line-height: 1.2;

          vertical-align:
            middle;

          overflow-wrap:
            anywhere;
        }

        .table-center {
          text-align:
            center;
        }

        .table-dose {
          font-weight: 900 !important;
        }

        .lot-column {
          width: 30%;

          text-align:
            center !important;
        }

        .dose-column {
          width: 17%;

          text-align:
            center !important;
        }

        /* ===================================================
           TABELA COM MUITOS ITENS
        =================================================== */

        .memorandum-table.compact-table {
          font-size: 7.5px;
        }

        .memorandum-table.compact-table th {
          padding:
            3px 4px;

          font-size:
            7px;
        }

        .memorandum-table.compact-table td {
          height: 15px;

          padding:
            2px 4px;

          font-size:
            7.5px;
        }

        .memorandum-table.very-compact-table {
          font-size:
            6.8px;
        }

        .memorandum-table.very-compact-table th {
          padding:
            2px 3px;

          font-size:
            6.5px;
        }

        .memorandum-table.very-compact-table td {
          height: 13px;

          padding:
            2px 3px;

          font-size:
            6.8px;
        }

        /* ===================================================
           TOTAL
        =================================================== */

        .memorandum-total {
          display: flex;

          align-items: center;

          justify-content:
            flex-end;

          gap: 12px;

          margin-top: 5px;

          padding-top: 4px;

          border-top:
            1px solid
            #cbd5e1;
        }

        .memorandum-total span {
          color:
            #64748b;

          font-size: 8px;

          font-weight: 900;
        }

        .memorandum-total strong {
          color:
            #1d4ed8;

          font-size: 11px;

          font-weight: 900;
        }

        /* ===================================================
           ASSINATURAS
        =================================================== */

        .memorandum-signatures {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 18mm;

          margin-top: 9mm;

          padding:
            0 8mm;
        }

        .signature-block {
          text-align:
            center;
        }

        .signature-line {
          margin-bottom:
            5px;

          border-top:
            1px solid
            #0f172a;
        }

        .signature-block strong {
          display: block;

          color:
            #0f172a;

          font-size: 8px;

          font-weight: 900;
        }

        .signature-block p {
          margin:
            3px 0 0;

          color:
            #64748b;

          font-size: 7px;
        }

        .signature-date {
          margin-top:
            5px !important;
        }

        /* ===================================================
           LINHA DE CORTE
        =================================================== */

        .cut-line {
          position: relative;

          display: flex;

          height: 10mm;

          align-items: center;

          justify-content:
            center;
        }

        .cut-line::before {
          position: absolute;

          right: 0;
          left: 0;

          border-top:
            1px dashed
            #94a3b8;

          content: '';
        }

        .cut-line span {
          position: relative;

          z-index: 1;

          padding:
            0 8px;

          background:
            white;

          color:
            #64748b;

          font-size: 7px;

          font-weight: 900;
        }

        /* ===================================================
           IMPRESSÃO
        =================================================== */

        @media print {

          @page {
            size:
              A4 portrait;

            margin: 0;
          }

          html,
          body {
            width:
              210mm !important;

            height:
              297mm !important;

            margin:
              0 !important;

            padding:
              0 !important;

            background:
              white !important;
          }

          body * {
            visibility:
              hidden !important;
          }

          #memorandum-print,
          #memorandum-print * {
            visibility:
              visible !important;
          }

          #memorandum-print {
            position:
              absolute !important;

            top:
              0 !important;

            left:
              0 !important;

            width:
              210mm !important;

            height:
              297mm !important;

            margin:
              0 !important;

            padding:
              3mm 7mm !important;

            background:
              white !important;

            box-shadow:
              none !important;

            overflow:
              hidden !important;
          }

          .no-print {
            display:
              none !important;
          }

          .memorandum-copy {
            break-inside:
              avoid !important;

            page-break-inside:
              avoid !important;
          }

          .memorandum-table tr {
            break-inside:
              avoid !important;

            page-break-inside:
              avoid !important;
          }

          .memorandum-signatures {
            break-inside:
              avoid !important;

            page-break-inside:
              avoid !important;
          }

        }

        `}
      </style>

    </div>
  );
};