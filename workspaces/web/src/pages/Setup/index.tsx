import {MouseEventHandler, useMemo, useState} from "react";
import {apiClientNoAuth} from "../../data/clients.ts";
import { TCompleteSetupRequest } from "@dataramen/types";
import {useForm} from "../../hooks/form/useForm.ts";
import {Alert} from "../../widgets/Alert";
import ImageURL from "../../assets/dataramen.svg";
import {AxiosError} from "axios";

const card = "flex flex-col gap-2 bg-white px-4";
const badgePending = "px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-lg whitespace-nowrap";
const badgeDone = "px-2 py-1 bg-green-200 text-green-800 text-xs rounded-lg";
const line = "h-1 w-full bg-gray-100 my-10";

const Badge = ({ done }: { done: boolean }) => {
  return (
    done ? <span className={badgeDone}>Done</span> : <span className={badgePending}>In progress</span>
  );
};

export const Setup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [form, { change }] = useForm<TCompleteSetupRequest & { confirmPassword: string; confirmDb: boolean }>({
    userName: '',
    setupAccessToken: '',
    userPassword: '',
    confirmPassword: '',
    confirmDb: false,
  });

  const steps = useMemo(() => {
    return {
      user: form.userName.length > 0 && form.userPassword.length > 0 && form.userPassword === form.confirmPassword,
      appDb: form.confirmDb,
      accessToken: form.setupAccessToken.length > 0,
    };
  }, [form]);

  const onSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setError(undefined);
    if (form.userPassword !== form.confirmPassword) {
      setError('Password does not match');
      return;
    }

    setIsSubmitting(true);
    apiClientNoAuth.post(`/setup`, {
      setupAccessToken: form.setupAccessToken,
      userPassword: form.userPassword,
      userName: form.userName,
    } satisfies TCompleteSetupRequest)
      .then(() => {
        window.location.href="/";
      })
      .catch((e: AxiosError<{ error: string }>) => {
        if (e.response?.data?.error) {
          setError(e.response?.data?.error);
        } else {
          setError("Failed to setup local service, try again");
        }

      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <main className="w-full min-h-screen flex justify-center">
      <div className="w-full md:w-2xl py-4">
        <img className="mx-auto mb-10" src={ImageURL} width={128} height={128} alt="DataRamen" />

        <div className={card}>
          <h1 className="page-head">DataRamen Setup Wizard</h1>
          <p className="mt-2">Welcome to the DataRamen setup wizard. Complete the steps below to start using DataRamen.</p>
        </div>

        <div className={line} />

        <div className={card}>
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold">Step 1: Create the main account</h2>
            <Badge done={steps.user} />
          </div>

          <p>This account will be assigned the <span className="font-semibold">`Owner`</span> role. The owner can manage the application and invite additional users later from within the app.</p>

          <input className="input" onChange={change("userName")} disabled={isSubmitting} placeholder="Username" />
          <input className="input" onChange={change("userPassword")} disabled={isSubmitting} placeholder="Password" type="password" />
          <input className="input" onChange={change("confirmPassword")} disabled={isSubmitting} placeholder="Confirm password" type="password" />
        </div>

        <div className={line} />

        <div className={card}>
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold">Step 2: Configure the application database</h2>
            <Badge done={steps.appDb} />
          </div>

          {__CLIENT_CONFIG__.usesCustomDb ? (
            <>
              <p>You are using custom database to store internal data such as query history, users, and connections.</p>

              <label>
                <input className="mr-2" type="checkbox" checked={form.confirmDb} disabled={isSubmitting} onChange={change("confirmDb")} />
                I confirm that my database configuration is correct
              </label>
            </>
          ) : (
            <>
              <p>You are using default <span className="font-semibold">SQLite</span> database to store internal data such as query history, users, and connections.</p>
              <p>You can (and we strongly recommend that you do) configure a custom database instead. Follow <a target="_blank" href="https://dataramen.xyz/guides/configure-custom-app-db/" className="text-blue-800 underline">these instructions</a> to set it up.</p>

              <Alert variant="warning">
                Keep in mind that if you are running in ephemeral environment you may lose your data. If you are running in a Docker, make sure you mount SQLite DB as a volume.
              </Alert>

              <label>
                <input className="mr-2" type="checkbox" checked={form.confirmDb} disabled={isSubmitting} onChange={change("confirmDb")} />
                I confirm that my database configuration is correct
              </label>
            </>
          )}
        </div>

        <div className={line} />

        <div className={card}>
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold">Step 3: Verify the setup access token</h2>
            <Badge done={steps.accessToken} />
          </div>

          <p>To confirm that you have access to the server, enter the setup access token. You can find this token in the server startup logs.</p>

          <input className="input" onChange={change("setupAccessToken")} disabled={isSubmitting} placeholder="Setup access token" />

          {error && (
            <Alert variant="danger">{error}</Alert>
          )}

          <div className="flex justify-end mt-10">
            <button
              className="button primary"
              disabled={isSubmitting || !steps.user || !steps.appDb || !steps.accessToken}
              onClick={onSubmit}
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
