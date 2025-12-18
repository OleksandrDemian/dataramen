import {Command} from "commander";
import {TModule} from "./types/commands";
import {TApp} from "./types/app";

const initModule = (command: Command, module: TModule) => {
  module.commands.forEach(cmdProto => {
    command
      .command(cmdProto.command)
      .description(cmdProto.description)
      .action(cmdProto.handler);
  });
}

export function createCommanderApp (): TApp<Command> {
  const program = new Command();

  const app: TApp<Command> = {
    id: "commander",
    setMetadata: (meta) => {
      program
        .name(meta.name)
        .description(meta.description)
        .version(meta.version, "-v, --version", "Show version");
      return app;
    },
    setDefaultCommand: (cmd) => {
      program
        .command("default", { hidden: true, isDefault: true })
        .action(cmd.handler);
      return app;
    },
    setModules: (modules) => {
      modules.forEach(module => {
        if (module.name === "root") {
          initModule(program, module);
        } else {
          const moduleCommand = program
            .command(module.name)
            .description(`(Module) ${module.description}`);
          initModule(moduleCommand, module);
        }
      });
      return app;
    },
    start: () => {
      program.parse();
      return app;
    },
    getHandler: () => program,
  };

  return app;
}
