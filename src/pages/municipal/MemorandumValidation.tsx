import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';

import { Button } from '../../components/ui';

import {
  getRequestByProtocol,
  RequestItem,
} from '../../data/mockRequests';

type LocationState = {
  memorandumNumber?: string;
  analyzedItems?: RequestItem[];
};

export const Memorandum = () => {
  const navigate = useNavigate();

  const { protocol = '' } = useParams();

  const location = useLocation();

  const state = (location.state || {}) as LocationState;

  const request = getRequestByProtocol(protocol);

  if (!request) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold">
          Solicitação não encontrada.
        </h1>

        <Button
          className="mt-4"
          onClick={() =>
            navigate('/app/solicitacoes')
          }
        >
          Voltar
        </Button>
      </div>
    );
  }

  const memorandumNumber =
    state.memorandumNumber ||
    request.memorandumNumber ||
    'MEM-2026-000005';

  const items =
    state.analyzedItems ||
    request.items;

  const releaseDate =
    request.authorizedAt ||
    '19/08/2026 10:33';

  const requesterRole =
    'ADMINISTRATIVO';

  const cnes =
    '2278731';

  const renderItems = () => {
    return (
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 text-left font-bold">
              Vacina
            </th>

            <th className="w-[31%] border border-black px-2 py-1 text-left font-bold">
              Lote
            </th>

            <th className="w-[15%] border border-black px-2 py-1 text-left font-bold">
              Qtd
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border border-black px-2 py-1">
                {item.vaccineName}
              </td>

              <td className="border border-black px-2 py-1">
                {item.vaccineId.toUpperCase()}
              </td>

              <td className="border border-black px-2 py-1">
                {item.authorizedQuantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderVoucher = (
    copyTitle: string,
    footerType: 'received' | 'released'
  ) => {
    return (
      <section className="voucher flex min-h-[132mm] flex-col bg-white px-4 py-3 text-black">

        {/* CABEÇALHO */}
        <div className="flex items-start justify-between">

          <div>
            <div className="text-lg font-extrabold text-sky-600">
              IMUNIZA+
            </div>

            <h1 className="mt-1 text-base font-bold">
              Comprovante de liberação
            </h1>

            <p className="text-[10px] text-gray-500">
              Solicitação nº {request.protocol}
            </p>
          </div>

          <div className="rounded bg-sky-50 px-2 py-1 text-[9px] font-bold text-sky-600">
            {copyTitle}
          </div>

        </div>

        {/* DADOS */}
        <div className="mt-2 grid grid-cols-2 gap-x-8 text-[9px] leading-4">

          <div className="grid grid-cols-[70px_1fr]">

            <span className="text-gray-500">
              Solicitante
            </span>

            <span className="font-medium">
              {request.requesterName}
            </span>

            <span className="text-gray-500">
              Unidade
            </span>

            <span className="font-medium">
              {request.unitName} – CNES {cnes}
            </span>

          </div>

          <div className="grid grid-cols-[60px_1fr]">

            <span className="text-gray-500">
              Cargo
            </span>

            <span className="font-medium">
              {requesterRole}
            </span>

            <span className="text-gray-500">
              Liberação
            </span>

            <span className="font-medium">
              {releaseDate}
            </span>

          </div>

        </div>

        {/* ITENS */}
        <div className="mt-2">

          <h2 className="mb-1 text-[10px] font-bold">
            Itens liberados
          </h2>

          {renderItems()}

        </div>

        {/* ESPAÇO FLEXÍVEL */}
        <div className="flex-1" />

        {/* ASSINATURA */}
        {footerType === 'received' ? (
          <div className="mt-4 grid grid-cols-[1fr_130px] gap-8">

            <div>
              <div className="border-b border-black" />

              <p className="mt-1 text-center text-[8px] text-gray-500">
                Recebido por
              </p>
            </div>

            <div>
              <div className="border-b border-black" />

              <p className="mt-1 text-center text-[8px] text-gray-500">
                Data
              </p>
            </div>

          </div>
        ) : (
          <div className="mt-4 grid grid-cols-[1fr_130px] gap-8">

            <div>
              <p className="mb-1 text-[9px] font-semibold">
                Imunização Central
              </p>

              <div className="border-b border-black" />

              <p className="mt-1 text-center text-[8px] text-gray-500">
                Responsável pela liberação
              </p>
            </div>

            <div>
              <p className="mb-1 text-[9px]">
                19/08/2026
              </p>

              <div className="border-b border-black" />

              <p className="mt-1 text-center text-[8px] text-gray-500">
                Data
              </p>
            </div>

          </div>
        )}

        {/* RODAPÉ */}
        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-1 text-[8px] text-gray-500">

          <span>
            IMUNIZA+
          </span>

          <span>
            {memorandumNumber}
          </span>

        </div>

      </section>
    );
  };

  return (
    <>
      <style>
        {`
          @page {
            size: A4 portrait;
            margin: 6mm;
          }

          @media print {
            html,
            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .no-print {
              display: none !important;
            }

            .print-page {
              width: 100%;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
            }

            .voucher {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="mx-auto max-w-[1000px] space-y-4">

        {/* BOTÕES */}
        <div className="no-print flex items-center justify-between">

          <Button
            variant="outline"
            onClick={() =>
              navigate('/app/solicitacoes')
            }
          >
            <ArrowLeft
              size={16}
              className="mr-2"
            />

            Voltar
          </Button>

          <Button
            onClick={() =>
              window.print()
            }
          >
            <Printer
              size={16}
              className="mr-2"
            />

            Imprimir
          </Button>

        </div>

        {/* FOLHA A4 */}
        <div className="print-page bg-gray-100 p-4">

          <div className="mx-auto w-full max-w-[210mm] bg-white shadow-sm print:shadow-none">

            {/* VIA PROGRAMA */}
            {renderVoucher(
              'Via Programa de Imunização',
              'received'
            )}

            {/* LINHA DE CORTE */}
            <div className="relative my-1 border-t border-dashed border-gray-400">

              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[8px] text-gray-500">
                Recorte aqui
              </span>

            </div>

            {/* VIA UNIDADE */}
            {renderVoucher(
              'Via Unidade Solicitante',
              'released'
            )}

          </div>

        </div>

      </div>
    </>
  );
};