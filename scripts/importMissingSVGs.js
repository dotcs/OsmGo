const path = require('path')
const fs = require('fs')

const { createWriteStream } = require('fs')
const { pipeline } = require('stream')
const { promisify } = require('util')
const fetch = require('node-fetch')

const assetsFolder = path.join(__dirname, '..', 'src', 'assets')
const tagsOsmgoPath = path.join(assetsFolder, 'tagsAndPresets', 'tags.json')

const tagConfig = JSON.parse(fs.readFileSync(tagsOsmgoPath, 'utf8'))
const tagsOsmgo = tagConfig.tags
const pathOsmGoSvgFolder = path.join(__dirname, '..', 'resources', 'IconsSVG')

const idFaSvgUrl = `https://raw.githubusercontent.com/openstreetmap/iD/develop/svg/fontawesome`
const temakiSvgUrl = `https://raw.githubusercontent.com/ideditor/temaki/main/icons`

// https://raw.githubusercontent.com/ideditor/temaki/main/icons/mast.svg

const download = async ({ url, path }) => {
    const streamPipeline = promisify(pipeline)

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`unexpected response ${response.statusText}`)
    }

    await streamPipeline(response.body, createWriteStream(path))
}

const run = async () => {
    console.info('Import of missing SVGs')
    for (const t of tagsOsmgo) {
        const pathCurrentSVG = path.join(pathOsmGoSvgFolder, `${t.icon}.svg`)
        if (t.icon && !fs.existsSync(pathCurrentSVG)) {
            console.log(`${t.icon}.svg`)
            if (/^fa/.test(t.icon)) {
                // => font awsome
                const iconIDUrl = `${idFaSvgUrl}/${t.icon}.svg`
                try {
                    await download({
                        url: iconIDUrl,
                        path: pathCurrentSVG,
                    })
                } catch (err) {
                    console.error(err)
                }
            } else if (/^temaki/.test(t.icon)) {
                // => temaki
                const iconTemakiUrl = `${temakiSvgUrl}/${
                    t.icon.split('temaki-')[1]
                }.svg`
                try {
                    await download({
                        url: iconTemakiUrl,
                        path: pathCurrentSVG,
                    })
                } catch (err) {
                    console.error(err)
                }
            }
        }
    }
}

run()
