import { resetDemo } from '../data/account';
import { confirmAction } from './dialogs';

// Asks first, then starts the demo over (see resetDemo). Shared by
// Settings → Demo and the empty Pacers page. True if it reset.
export async function confirmResetDemo(): Promise<boolean> {
  const ok = await confirmAction({
    title: 'Reset demo',
    message:
      'Undo every like, pass, match, chat and plan and start the demo fresh. Your profile stays.',
    confirmLabel: 'Reset demo',
    destructive: true,
  });
  if (ok) await resetDemo();
  return ok;
}
