import { formSections } from "../fieldConfig.js";

export default function CustomerForm({ values, onChange, onSubmit, loading }) {
  function handleFieldChange(name, value) {
    onChange({ ...values, [name]: value });
  }

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {formSections.map((section) => (
        <fieldset className="form__section" key={section.title}>
          <legend className="form__legend">
            <span className="form__eyebrow">{section.eyebrow}</span>
            {section.title}
          </legend>

          <div className="form__grid">
            {section.fields.map((field) => (
              <label className="field" key={field.name}>
                <span className="field__label">{field.label}</span>
                {field.type === "select" ? (
                  <select
                    className="field__control"
                    value={values[field.name]}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  >
                    {field.options.map((opt) => {
                      const value = typeof opt === "string" ? opt : opt.value;
                      const optLabel = typeof opt === "string" ? opt : opt.label;
                      return (
                        <option value={value} key={value}>
                          {optLabel}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    className="field__control"
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 1}
                    value={values[field.name]}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    required
                  />
                )}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <button className="button button--primary" type="submit" disabled={loading}>
        {loading ? "Reading signal…" : "Run prediction"}
      </button>
    </form>
  );
}
