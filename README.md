Node.js script to download PDFs using URL from bib reference file. Currently works with ACM Guide to Computing Literature Database and IEEE Xplore Digital Library.

Please note that the script doesn't currently support login and should be run on networks with access to the aforementioned databases (eg. campus network, academic proxy etc.)

### Instructions
1. Clone the git repository
2. Install npm files with `npm i`
3. Copy `.bib` file into directory and rename to `download.bib`
4. Run `node main`

##### Any help in extending this to other databases would be greatly appreciated.