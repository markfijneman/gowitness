<h1 align="center">
  🔍 gowitness fork
</h1>

<h4 align="center">A golang, web screenshot utility using Chrome Headless.</h4>

## 🔍 Introduction
This project is a fork of `gowitness`, which is a website screenshot utility written in Golang, that uses Chrome Headless to generate screenshots of web interfaces using the command line, with a handy report viewer to process results. Both Linux and macOS is supported, with Windows support mostly working.

Inspiration for `gowitness` comes from [Eyewitness](https://github.com/ChrisTruncer/EyeWitness). If you are looking for something with lots of extra features, be sure to check it out along with these [other](https://github.com/afxdub/http-screenshot-html) [projects](https://github.com/breenmachine/httpscreenshot).

## ✏ Changes
Some changes compared to the [original](https://github.com/sensepost/gowitness) project:
- Improved UI & design
- Screenshots open in a dialog instead of a separate page when clicked
- Server keeps track of clicked links and makes them purple
- Added more badges for server information and software ('generator' meta tag)
- Fast gallery search

## 📃 Documentation
For installation information and other documentation, please refer to the wiki of the original project [here](https://github.com/sensepost/gowitness/wiki).

## 🔗 Credits
`gowitness` would not have been posssible without some of these amazing projects: [chromedp](https://github.com/chromedp/chromedp), [tabler](https://github.com/tabler/tabler), [zerolog](https://github.com/rs/zerolog), [cobra](https://github.com/spf13/cobra), [gorm](https://github.com/go-gorm/gorm), [go-nmap](https://github.com/lair-framework/go-nmap), [wappalyzergo](https://github.com/projectdiscovery/wappalyzergo), [goimagehash](https://github.com/corona10/goimagehash)

## ⚖ License
`gowitness` is licensed under a [GNU General Public v3 License](https://www.gnu.org/licenses/gpl-3.0.en.html).
