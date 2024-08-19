import Benchmark from 'benchmark';
import { atom } from '../src/wrappers/vanilla-atom';
import { Atom } from '../src/wrappers/vanilla-class-atom';
import { singleSelector } from '../src/selector/singleSelector';
import { SingleSelector } from '../src/selector/SingleSelector-class';
import { setSignalFactory, signalFactory } from '../src';

//
// Função para executar o benchmark
async function runBenchmark() {
  let results: { name: string; hz: number; stats: any }[] = [];

  //
  //

  function cycleListener(event: any) {
    console.log(String(event.target));
    results.push({
      name: event.target.name,
      hz: event.target.hz, // Operações por segundo
      stats: event.target.stats, // Estatísticas detalhadas
    });
  }

  //
  //

  function completeListener(resolve: (value: unknown) => void) {
    // Ordenar resultados do mais rápido para o mais lento
    results.sort((a, b) => b.hz - a.hz);

    const fastest = results[0];
    const slowest = results[results.length - 1];
    const factor = fastest.hz / slowest.hz;

    console.log(`Fastest is "${fastest.name}"`);
    console.log(
      `"${fastest.name}" is ${factor.toFixed(2)} times faster than "${slowest.name}"`,
    );

    resolve({ fastest: fastest.name, factor });
  }

  //
  //

  function newSuite(run: boolean, cb: (suite: Benchmark.Suite) => void) {
    if (!run) return;

    results = [];
    return new Promise((resolve) => {
      const suite = new Benchmark.Suite()
        .on('cycle', cycleListener)
        .on('complete', () => completeListener(resolve));

      cb(suite);
      suite.run({ async: true });
    });
  }

  //
  //

  await newSuite(true, (suite) => {
    console.log('Benchmarking Atom creation\n');

    setSignalFactory((initial) => new Atom(initial));

    suite
      .add('Create Atom using Function', () => {
        atom(0);
      })
      .add('Create Atom using Class', () => {
        new Atom(0);
      })
      .add('Create Atom using signalFactory with Class', () => {
        signalFactory(0);
      });
  });

  //
  //

  await newSuite(false, (suite) => {
    console.log('\nBenchmarking Atom subscription\n');

    const signal1 = atom(0);
    const signal2 = new Atom(0);

    suite
      .add('Subscribe Atom using Function', () => {
        const unsub = signal1.subscribe(() => {});
        unsub();
      })
      .add('Subscribe Atom using Class', () => {
        const unsub = signal2.subscribe(() => {});
        unsub();
      });
  });

  //
  //

  await newSuite(false, (suite) => {
    console.log('\nBenchmarking Atom value change\n');

    const signal1 = atom(0);
    const signal2 = new Atom(0);

    suite
      .add('Change Atom value using Function', () => {
        signal1.value = 1;
        signal1.value = 2;
      })
      .add('Change Atom value using Class', () => {
        signal2.value = 1;
        signal2.value = 2;
      });
  });

  //
  //

  await newSuite(false, (suite) => {
    console.log('\nBenchmarking singleSelector creation\n');

    const signal1 = atom(0);
    const signal2 = new Atom(0);

    suite
      .add('Create singleSelector using Function', () => {
        singleSelector(signal1, (value) => value);
      })
      .add('Create singleSelector using Class', () => {
        new SingleSelector(signal2, (value) => value);
      });
  });
}

//
//

runBenchmark();
