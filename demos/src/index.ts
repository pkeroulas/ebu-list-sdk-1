import yargs from 'yargs';
import { IArgs } from './types';

const parser = yargs(process.argv.slice(2))
    .usage('Usage: $0 <command> [options]')
    .command('login', 'Log in a LIST instance and print the version.')
    .example(
        '$0 login --url https://list.ebu.io --user demo --pass demo',
        'Get the version of the EBU hosted LIST instance.'
    )
    .command('pcap-upload <pcap-file>', 'Upload a pcap file.')
    .example(
        '$0 pcap-upload ST2110.pcap --url https://list.ebu.io --user demo --pass demo',
        'Get the version of the EBU hosted LIST instance.'
    )
    .command('live-capture', 'Do a live capture (requires a capture engine).')
    .demandCommand(1, 1)
    .help('h')
    .alias('h', 'help')
    .options({
        baseUrl: { type: 'string', alias: 'b', nargs: 1, demandOption: true, describe: 'The base URL of the server' },
        username: { type: 'string', alias: 'u', nargs: 1, demandOption: true, describe: 'The user name' },
        password: { type: 'string', alias: 'p', nargs: 1, demandOption: true, describe: 'The password' },
    })
    .wrap(yargs.terminalWidth())
    .epilog('© 2020 Bisect Lda');

const argv: IArgs = parser.argv;

const command = argv._ && argv._.length > 0 ? argv._[0] : undefined;

if (command === undefined) {
    process.stderr.write('No command was specified.');
    process.exit(-1);
}

/*
    The modules in demos are expected to export a function 'run' with the following signature:
    () => void
*/
const run = async () => {
    const d = await import(`./demos/${command}`);
    d.run(argv);
};

run().catch(e => {
    process.stderr.write(`Error: ${e} ${e.stack}\n`);
    process.exit(-1);
});