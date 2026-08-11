import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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

  const state =
    (location.state || {}) as LocationState;

  const request =
    getRequestByProtocol(protocol);

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

  const publicUrl =
    `${window.location.origin}/memorando/${memorandumNumber}`;

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
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

          Imprimir memorando
        </Button>
      </div>

      <article className="bg-white p-8 text-slate-900 shadow-sm print:shadow-none">

        <div className="flex items-start justify-between gap-8 border-b-2 border-slate-900 pb-5">

          <div>
            <p className="text-sm font-bold uppercase tracking-widest">
              IMUNIZA+
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              Central de Imunização de Magé
            </h1>

            <h2 className="mt-1 text-lg font-semibold">
              Memorando de Entrega de Imunobiológicos
            </h2>
          </div>

          <div className="text-center">

            <QRCodeSVG
              value={publicUrl}
              size={105}
            />

            <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-500">
              <QrCode size={11} />

              Validar documento
            </div>

          </div>

        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">

          <p>
            <strong>
              Solicitação:
            </strong>{' '}
            {request.protocol}
          </p>

          <p>
            <strong>
              Memorando:
            </strong>{' '}
            {memorandumNumber}
          </p>

          <p>
            <strong>
              Município:
            </strong>{' '}
            Magé
          </p>

          <p>
            <strong>
              Unidade:
            </strong>{' '}
            {request.unitName}
          </p>

          <p>
            <strong>
              Solicitante:
            </strong>{' '}
            {request.requesterName}
          </p>

          <p>
            <strong>
              Data da solicitação:
            </strong>{' '}
            {request.createdAt}
          </p>

          <p>
            <strong>
              Data da autorização:
            </strong>{' '}
            {
              request.authorizedAt ||
              '11/08/2026'
            }
          </p>

          <p>
            <strong>
              Autorizado por:
            </strong>{' '}
            {
              request.authorizedBy ||
              'Coordenação Municipal'
            }
          </p>

        </div>

        <table className="mt-8 w-full border-collapse text-sm">

          <thead>

            <tr className="bg-slate-100">

              <th className="border border-slate-400 px-3 py-2 text-left">
                Vacina
              </th>

              <th className="border border-slate-400 px-3 py-2 text-right">
                Estoque informado
              </th>

              <th className="border border-slate-400 px-3 py-2 text-right">
                Solicitado
              </th>

              <th className="border border-slate-400 px-3 py-2 text-right">
                Autorizado
              </th>

            </tr>

          </thead>

          <tbody>

            {items.map((item) => (

              <tr key={item.id}>

                <td className="border border-slate-400 px-3 py-3 font-semibold">
                  {item.vaccineName}
                </td>

                <td className="border border-slate-400 px-3 py-3 text-right">
                  {
                    item.localStockReported
                  }
                </td>

                <td className="border border-slate-400 px-3 py-3 text-right">
                  {
                    item.requestedQuantity
                  }
                </td>

                <td className="border border-slate-400 px-3 py-3 text-right font-bold">
                  {
                    item.authorizedQuantity
                  }
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        <div className="mt-10">

          <p className="text-sm">
            Declaro ter recebido os imunobiológicos discriminados acima, nas quantidades autorizadas neste memorando.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">

            <div>
              <p className="text-sm">
                Nome:
              </p>

              <div className="mt-8 border-b border-slate-700" />
            </div>

            <div>
              <p className="text-sm">
                Cargo:
              </p>

              <div className="mt-8 border-b border-slate-700" />
            </div>

            <div>
              <p className="text-sm">
                Assinatura:
              </p>

              <div className="mt-8 border-b border-slate-700" />
            </div>

            <div>
              <p className="text-sm">
                Carimbo da unidade:
              </p>

              <div className="mt-16 border-b border-slate-700" />
            </div>

            <div>
              <p className="text-sm">
                Data do recebimento:
              </p>

              <p className="mt-6">
                ____/____/________
              </p>
            </div>

          </div>

        </div>

        <footer className="mt-12 border-t border-slate-300 pt-4 text-center text-[10px] text-slate-500">
          Documento gerado pelo IMUNIZA+ • {memorandumNumber}
        </footer>

      </article>

    </div>
  );
};