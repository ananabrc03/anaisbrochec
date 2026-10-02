const form = document.querySelector<HTMLFormElement>('#contact-form');
if (form) {
  const status = form.querySelector<HTMLElement>('.form-status')!,
    button = form.querySelector<HTMLButtonElement>('[type=submit]')!,
    file = form.elements.namedItem('fichier') as HTMLInputElement,
    message = form.elements.namedItem('message') as HTMLTextAreaElement;
  const fields = [
    ...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input:not([type=hidden]),select,textarea',
    ),
  ];
  async function validate(field: (typeof fields)[number]) {
    let error = '';
    if (!field.checkValidity())
      error =
        field instanceof HTMLInputElement && field.type === 'email' && field.value
          ? form!.dataset.email!
          : form!.dataset.required!;
    if (field === file && file.files?.[0]) {
      const f = file.files[0];
      if (f.size > 5 * 1024 * 1024) error = form!.dataset.fileSize!;
      else if (
        f.type !== 'application/pdf' ||
        String.fromCharCode(...new Uint8Array(await f.slice(0, 5).arrayBuffer())) !== '%PDF-'
      )
        error = form!.dataset.fileType!;
    }
    field.setAttribute('aria-invalid', String(!!error));
    const target = document.getElementById('error-' + field.name);
    if (target) target.textContent = error;
    return !error;
  }
  fields.forEach((f) => f.addEventListener('blur', () => void validate(f)));
  message.addEventListener(
    'input',
    () => (form.querySelector('.counter')!.textContent = `${message.value.length} / 5000`),
  );
  file.addEventListener('change', () => {
    const selected = file.files?.[0];
    form.querySelector('.file-info')!.textContent = selected
      ? `${selected.name} · ${(selected.size / 1024).toFixed(0)} Ko`
      : '';
    form.querySelector<HTMLElement>('.remove-file')!.hidden = !selected;
    void validate(file);
  });
  form.querySelector('.remove-file')?.addEventListener('click', () => {
    file.value = '';
    file.dispatchEvent(new Event('change'));
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const valid = await Promise.all(fields.map(validate));
    if (valid.some((v) => !v)) {
      fields[valid.indexOf(false)].focus();
      return;
    }
    const data = new FormData(form);
    data.set('consentement', 'true');
    button.disabled = true;
    button.textContent = form.dataset.sending!;
    status.textContent = '';
    try {
      const response = await fetch(
        `${document.body.dataset.supabaseUrl}/functions/v1/submit-contact`,
        {
          method: 'POST',
          headers: {
            apikey: document.body.dataset.supabaseKey!,
            Authorization: 'Bearer ' + document.body.dataset.supabaseKey!,
          },
          body: data,
          signal: AbortSignal.timeout(30000),
        },
      );
      if (!response.ok) throw new Error('Submission failed');
      const result = await response.json();
      if (!result.ok) throw new Error('Submission failed');
      const success = document.createElement('div');
      success.className = 'form-success';
      success.setAttribute('role', 'status');
      success.tabIndex = -1;
      const check = document.createElement('span');
      check.textContent = '✓';
      check.setAttribute('aria-hidden', 'true');
      const text = document.createElement('p');
      text.textContent = form.dataset.success!;
      success.append(check, text);
      form.replaceWith(success);
      success.focus();
    } catch {
      status.textContent = form.dataset.error!;
      button.disabled = false;
      button.textContent = form.dataset.submit!;
    }
  });
}
