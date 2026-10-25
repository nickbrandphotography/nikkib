(() => {
const { $, clearBag } = window.NB;
const id = new URLSearchParams(location.search).get('session_id');
const title = $('#tyTitle'), msg = $('#tyMsg');
if (!id) { title.textContent = 'Your bag is waiting.'; msg.textContent = 'There is no order to show here. Head back to the collection whenever you are ready.'; }
else {
  fetch('/api/session?id=' + encodeURIComponent(id)).then(r => r.ok ? r.json() : Promise.reject()).then(d => {
    if (d.paid) {
      clearBag();
      title.textContent = 'Thank you.';
      msg.textContent = `Your order is confirmed${d.total ? ` (${d.currency} $${d.total.toFixed(2)})` : ''}. ${d.email ? `A receipt is on its way to ${d.email}. ` : ''}We will be in touch about your delivery. If you have any questions, just reply to your receipt or write to live@nikkibfashion.com.`;
    } else { title.textContent = 'Payment not completed.'; msg.textContent = 'It looks like that payment was not completed, so nothing was charged. Your bag is still saved if you would like to try again.'; }
  }).catch(() => { title.textContent = 'Thank you.'; msg.textContent = 'If your payment went through, a receipt will arrive by email shortly. If you are unsure, please write to live@nikkibfashion.com and we will check for you.'; });
}
})();
