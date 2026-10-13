import { useMemo, useState } from "react";
import { cn } from "./utils/cn";

const DECANT_SIZES = [3, 5, 10] as const;
const AVERAGE_DECANT_SIZE = 5;

const parseNumber = (value: string): number => {
  const normalized = value.replace(",", ".").replace(/\s/g, "");
  const num = parseFloat(normalized);
  return Number.isFinite(num) ? num : 0;
};

const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value);
  return rounded.toLocaleString("ru-RU");
};

const formatCount = (value: number): string => {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
};

export default function App() {
  const [bottlePrice, setBottlePrice] = useState<number>(12000);
  const [bottleVolume, setBottleVolume] = useState<number>(50);
  const [atomizerPrice, setAtomizerPrice] = useState<number>(50);
  const [consumablesTotal, setConsumablesTotal] = useState<number>(200);
  const [markup, setMarkup] = useState<number>(120);

  const costPerMl = useMemo(() => {
    if (bottleVolume <= 0) return 0;
    return (bottlePrice + consumablesTotal) / bottleVolume;
  }, [bottlePrice, consumablesTotal, bottleVolume]);

  const markupMultiplier = 1 + (markup || 0) / 100;

  const decantResults = useMemo(
    () =>
      DECANT_SIZES.map((size) => {
        const baseCost = costPerMl * size + atomizerPrice;
        const finalPrice = baseCost * markupMultiplier;
        const finalRounded = Math.max(0, Math.round(finalPrice));
        const profit = finalRounded - baseCost;
        const profitRounded = Math.max(0, Math.round(profit));
        return { size, finalRounded, profitRounded, baseCost };
      }),
    [costPerMl, atomizerPrice, markupMultiplier]
  );

  const mediumDecant = decantResults.find(
    (item) => item.size === AVERAGE_DECANT_SIZE
  );

  const fullDecantsCount =
    bottleVolume > 0 ? bottleVolume / AVERAGE_DECANT_SIZE : 0;

  const totalCost = useMemo(() => {
    const atomizersCost = atomizerPrice * fullDecantsCount;
    return bottlePrice + consumablesTotal + atomizersCost;
  }, [bottlePrice, consumablesTotal, atomizerPrice, fullDecantsCount]);

  const totalRevenue = useMemo(() => {
    if (!mediumDecant) return 0;
    return mediumDecant.finalRounded * fullDecantsCount;
  }, [mediumDecant, fullDecantsCount]);

  const totalProfit = totalRevenue - totalCost;

  const quickVolumes = [30, 50, 100];

  const handleQuickVolume = (volume: number) => {
    setBottleVolume(volume);
  };

  const handleQuickMarkup = (percent: number) => {
    setMarkup(percent);
  };

  const isQuickVolumeActive = (volume: number) => bottleVolume === volume;
  const isQuickMarkupActive = (percent: number) => markup === percent;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.12),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(45,212,191,0.25),_transparent_55%)]" />

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-6 text-center sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <span>Калькулятор распива парфюмерии</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Расчет цены отливантов за пару кликов
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Введите цену и объем флакона, стоимость расходников и наценку — калькулятор
            посчитает рекомендованную цену и прибыль для отливантов 3, 5 и 10 мл.
          </p>
        </header>

        <main className="flex flex-1 flex-col gap-5 sm:gap-6">
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.75)] backdrop-blur sm:p-5 lg:p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Исходные данные
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Цена флакона */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-200">
                  Цена флакона, ₽
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={bottlePrice}
                    onChange={(e) => setBottlePrice(parseNumber(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-emerald-300/80 focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="Например, 12000"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">
                    ₽
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Полная стоимость оригинального флакона.
                </p>
              </div>

              {/* Объем флакона */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-200">
                  Объем флакона, мл
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickVolumes.map((volume) => (
                    <button
                      key={volume}
                      type="button"
                      onClick={() => handleQuickVolume(volume)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                        isQuickVolumeActive(volume)
                          ? "border-emerald-300 bg-emerald-400 text-slate-950 shadow-[0_0_0_1px_rgba(16,185,129,0.6)]"
                          : "border-white/15 bg-slate-950/40 text-slate-100 hover:border-emerald-300/70 hover:bg-emerald-400/10"
                      )}
                    >
                      {volume} мл
                    </button>
                  ))}
                  <span className="text-[11px] text-slate-400">
                    или введите свой объем
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    value={bottleVolume}
                    onChange={(e) => setBottleVolume(parseNumber(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-emerald-300/80 focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="Например, 50"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">
                    мл
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Стандартные объемы: 30 / 50 / 100 мл.
                </p>
              </div>

              {/* Стоимость атомайзера */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-200">
                  Стоимость атомайзера, ₽
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={atomizerPrice}
                    onChange={(e) => setAtomizerPrice(parseNumber(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-emerald-300/80 focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="Например, 40"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">
                    ₽
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Цена одного пустого атомайзера.
                </p>
              </div>

              {/* Расходники */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-200">
                  Расходники всего на флакон, ₽
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={consumablesTotal}
                    onChange={(e) => setConsumablesTotal(parseNumber(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-emerald-300/80 focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="Например, 200"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">
                    ₽
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Шприцы, насадки и прочее — общая сумма за весь флакон. Мы сами
                  поделим ее на объем.
                </p>
              </div>

              {/* Процент наценки */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium text-slate-200">
                  Наценка / прибыль, %
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[100, 120].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleQuickMarkup(value)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                        isQuickMarkupActive(value)
                          ? "border-emerald-300 bg-emerald-400 text-slate-950 shadow-[0_0_0_1px_rgba(16,185,129,0.6)]"
                          : "border-white/15 bg-slate-950/40 text-slate-100 hover:border-emerald-300/70 hover:bg-emerald-400/10"
                      )}
                    >
                      {value}%
                    </button>
                  ))}
                  <span className="text-[11px] text-slate-400">
                    или свой процент
                  </span>
                </div>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={markup}
                    onChange={(e) => setMarkup(parseNumber(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-emerald-300/80 focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="Например, 120"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  100% — удвоить себестоимость. 120% — чуть больше прибыли.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/50 px-3 py-3 text-[11px] text-emerald-50 sm:px-4">
              <div>
                <div className="text-emerald-200/90">Себестоимость 1 мл</div>
                <div className="mt-0.5 text-base font-semibold">
                  {formatCurrency(costPerMl)} ₽
                </div>
              </div>
              <div className="text-emerald-100/80">
                Формула: (цена флакона + расходники) / объем флакона.
              </div>
            </div>
          </section>

          {/* Результаты по объемам */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] backdrop-blur sm:p-5 lg:p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Цена отливанта
            </h2>

            <div className="grid gap-3 sm:grid-cols-3">
              {decantResults.map((item) => (
                <div
                  key={item.size}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs shadow-sm shadow-black/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        {item.size} мл
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      Рекомендованная цена продажи
                    </div>
                    <div className="mt-1 text-xl font-semibold tracking-tight text-emerald-200">
                      {formatCurrency(item.finalRounded)} ₽
                    </div>
                  </div>
                  <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Чистая прибыль</span>
                      <span className="font-semibold text-emerald-300">
                        {formatCurrency(item.profitRounded)} ₽
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Общий итог */}
          <section className="rounded-3xl border border-emerald-500/25 bg-emerald-950/40 p-4 shadow-[0_16px_40px_rgba(16,185,129,0.45)] backdrop-blur-sm sm:p-5 lg:p-6">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Общий итог при полной распродаже флакона
                </h2>
                <p className="mt-1 text-[11px] text-emerald-100/80">
                  Считаем, что весь аромат разливается в отливанты по 5 мл.
                </p>
              </div>
              <div className="text-[11px] text-emerald-100/80">
                ≈ {formatCount(fullDecantsCount)} отливантов по 5 мл
              </div>
            </div>

            <div className="grid gap-3 text-xs text-emerald-50 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/25 bg-slate-950/40 p-3">
                <div className="text-[11px] text-emerald-100/80">
                  Всего затрат
                </div>
                <div className="mt-1 text-lg font-semibold tracking-tight">
                  {formatCurrency(totalCost)} ₽
                </div>
                <p className="mt-1 text-[11px] text-emerald-200/80">
                  Флакон + расходники + атомайзеры на весь объем.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/25 bg-slate-950/40 p-3">
                <div className="text-[11px] text-emerald-100/80">
                  Общая выручка
                </div>
                <div className="mt-1 text-lg font-semibold tracking-tight">
                  {formatCurrency(totalRevenue)} ₽
                </div>
                <p className="mt-1 text-[11px] text-emerald-200/80">
                  При продаже всех отливантов по рассчитанной цене.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/25 bg-slate-950/40 p-3">
                <div className="text-[11px] text-emerald-100/80">
                  Чистая прибыль
                </div>
                <div className="mt-1 text-lg font-semibold tracking-tight">
                  {formatCurrency(totalProfit)} ₽
                </div>
                <p className="mt-1 text-[11px] text-emerald-200/80">
                  Выручка минус все фактические затраты.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-6 text-center text-[11px] text-slate-500 sm:mt-8">
          Готовый файл dist/index.html можно загрузить на GitHub Pages как одиночный калькулятор
          распива парфюмерии.
        </footer>
      </div>
    </div>
  );
}
