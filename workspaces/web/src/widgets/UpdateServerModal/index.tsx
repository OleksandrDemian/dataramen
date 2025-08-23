import {useLocalServerStatus} from "../../data/queries/localServerStatus.ts";
import {compareSemver} from "../../utils/semver.ts";
import {Modal} from "../Modal";
import {Markdown} from "../Markdown";

const MD = `### ⚠️ You are running an outdated local server version.

Please update your local server version to **${__EXPECTED_SERVER_VERSION}**

### 🔧 Update Command

Update \`@dataramen/cli\` library:

\`\`\`bash
npm i -g @dataramen/cli
\`\`\`

After the update, re-run your local server:

\`\`\`bash
dataramen start
\`\`\`

Once done, click on the "Check again" button below or refresh the page.
`;

export const UpdateServerModal = () => {
  const { data: status, refetch } = useLocalServerStatus();

  if (!status?.active) {
    return null;
  }

  const hasCorrectVersion = compareSemver(status.version, __EXPECTED_SERVER_VERSION) === 0;

  if (hasCorrectVersion) {
    return null;
  }

  return (
    <Modal isVisible onClose={() => null}>
      <div>
        <Markdown content={MD} />

        <div className="flex justify-end mt-2">
          <button className="button primary" onClick={() => refetch()}>Check again</button>
        </div>
      </div>
    </Modal>
  );
};
