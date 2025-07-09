<script>
  const {data} = $props()
</script>

<h1>User: {data.address}</h1>

<h2>Reminders</h2>

<ul>
  {#each data.reminders as reminder}
    <li>{reminder.cadence.value} {reminder.type.value}</li>
  {/each}
</ul>

<h2>Create Reminder</h2>

<form
  method="POST">
  <input type="hidden" name="rdf:type :" value="rsp:Reminder">
  <input type="hidden" name="rsp:address" value={data.address}>
  <label>
    Type
    <select name="rsp:type :">
      <option value="rsp:ReminderEmail">Reminder Email</option>
    </select>
  </label>

  <label>
    Cadence
    <select name="rsp:cadence :">
      <option value="rsp:Quarterly">Quartlery</option>
      <option value="rsp:Monthly">Monthly</option>
    </select>
  </label>

  <button>Create Reminder</button>
</form>

<style>
  label, select {
    display: block;
  }
</style>