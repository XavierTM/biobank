
function status_500(err, res) {
   try { res.sendStatus(500) } catch {}
   console.error(err);
}

module.exports = status_500