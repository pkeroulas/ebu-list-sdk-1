import yargs from 'yargs';
import { IArgs } from './types';

const parser = yargs(process.argv.slice(2))
    .usage('Usage: $0 <command> [options]')
    .command('login', 'Log in a LIST instance and print the version.')
    .example(
        '$0 login -b https://list.ebu.io -u demo -p demo',
        'Get the version of the EBU hosted LIST instance.'
    )
    .command('browse-analysis', 'Select pcap and display stream details.')
    .example(
        '$0 browse-analysis -b https://list.ebu.io -u demo -p demo',
        'Show all pcaps and let the use select one and display associated streams'
    )
    .command('pcap-upload <pcap-file>', 'Upload a pcap file.')
    .example(
        '$0 pcap-upload ST2110.pcap -b https://list.ebu.io -u demo -p demo',
        'Upload a pcap file to EBU host LIST instance, analyze and show result.'
    )
    .command('live-capture', 'Do a live capture and analyze (requires a capture engine).')
    .example(
        '$0 live-capture -b https://my-live-ebu-list -u demo -p demo -d 10',
        'Ask the user to select the source to be captured (for 10sec) and analized and ask if pcap must be saved'
    )
    .example(
        '$0 live-capture -b https://list.ebu.io -f -u demo -p demo -m "239.0.0.1,239.0.0.2"',
        'Find live sources from multicasts list, ask for capture duration, repeat the capture-and-analyze loop forever and save faulty analysis'
    )
    .demandCommand(1, 1)
    .help('h')
    .alias('h', 'help')
    .options({
        baseUrl: { type: 'string', alias: 'b', nargs: 1, demandOption: true, describe: 'The base URL of the server' },
        username: { type: 'string', alias: 'u', nargs: 1, demandOption: true, describe: 'The user name' },
        password: { type: 'string', alias: 'p', nargs: 1, demandOption: true, describe: 'The password' },
        multicasts: { type: 'string', alias: 'm', nargs: 1, demandOption: false, describe: 'The stream multicast addresses list' },
        freerun: { type: 'boolean', alias: 'f', nargs: 0, demandOption: false, describe: 'Flag for free-running live capture and analysis' },
        duration: { type: 'number', alias: 'd', nargs: 1, demandOption: false, describe: 'Live capture duration in sec' },
    })
    .wrap(yargs.terminalWidth())
    .epilog('© 2021 Bisect Lda');

const command = parser.argv._ && parser.argv._.length > 0 ? parser.argv._[0] : undefined;

if (command === undefined) {
    process.stderr.write('No command was specified.');
    process.exit(-1);
}

/*
    The modules in demos are expected to export a function 'run' with the following signature:
    () => void
*/
const run = async () => {
    try {
        const d = await import(`./demos/${command}`);
        await d.run(parser.argv);
    } catch (e) {
        console.log(`Error: ${JSON.stringify(e)}`);
    }
};

run().catch(e => {
    process.stderr.write(`Error: ${e} ${e.stack}\n`);
    process.exit(-1);
});
