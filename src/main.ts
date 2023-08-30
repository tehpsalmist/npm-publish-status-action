import * as core from '@actions/core'
import { existsSync } from 'fs'
import { join } from 'path'
import { fetch } from 'cross-fetch'

async function run(): Promise<void> {
  try {
    const { name, version } = getPackageJSON()

    if (await packageVersionExists(name, version)) {
      core.setOutput('exists', 1)
    } else {
      core.setOutput('exists', 0)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    process.exit(core.ExitCode.Failure)
  }
}

run()

function getPackageJSON(): { name: string; version: string } {
  const { GITHUB_WORKSPACE = '' } = process.env

  if (!GITHUB_WORKSPACE) {
    throw new Error('action not being run in a valid github workspace')
  }

  const pathToPackage = join(GITHUB_WORKSPACE, 'package.json')
  if (!existsSync(pathToPackage))
    throw new Error("package.json could not be found in your project's root.")

  return require(pathToPackage)
}

async function packageVersionExists(name: string, version: string) {
  const registryUrl: string = core.getInput('registry-url') || 'https://registry.npmjs.org';
  const res = await fetch(
    `${registryUrl}/${name}/${version}`
  ).catch((err) =>
    err instanceof Error ? err : new Error(JSON.stringify(err))
  )

  if (res instanceof Error || res.status === 404) {
    return false
  }

  const json = await res
    .json()
    .catch((err) =>
      err instanceof Error ? err : new Error(JSON.stringify(err))
    )

  if (json instanceof Error) {
    return false
  }

  if (json.version === version) {
    return true
  }

  return false
}
