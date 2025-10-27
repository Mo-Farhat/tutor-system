import "../../css/faq/faq-ucat.css";

function Ucat() {
  return (
    <section
      className="row container-fluid section d-flex g-0 z-index-0 faq-ucat-main"
      id="faq-ucat-main"
    >
      <div className="row col-12 col-lg-9 d-flex faq-ucat-sec">
        <h1 className="fw-bold d-flex faq-ucat-main-h">UCAT</h1>

        <div class="accordion d-flex gap-3" id="faq-ucat-accordians-main">
          <div class="accordion-item" id="faq-ucat-ac-item">
            <h2 class="accordion-header">
              <button
                class="btn primary-button d-flex fw-bold w-100 faq-ucat-q"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseucat1"
                aria-expanded="true"
                aria-controls="panelsStayOpen-collapseucat1"
              >
                How can I get started?
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseucat1"
              class="accordion-collapse collapse"
            >
              <div class="accordion-body">
                Please navigate to our{" "}
                <a href="/ucat" className="faq-link">
                  UCAT page
                </a>{" "}
                to see more information on how you can get started!
              </div>
            </div>
          </div>
          <div class="accordion-item" id="faq-ucat-ac-item">
            <h2 class="accordion-header">
              <button
                class="btn primary-button d-flex fw-bold w-100 faq-ucat-q"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseucat2"
                aria-expanded="false"
                aria-controls="panelsStayOpen-collapseucat2"
              >
                What will I need for sessions?
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseucat2"
              class="accordion-collapse collapse"
            >
              <div class="accordion-body">
                You will need access to the MedEntry questionbank - the gold
                standard for UCAT questions. We have partnered with MedEntry to
                offer you a 10% discount on packages.
                <br />
                <br />
                <strong style={{ color: '#062a78' }}>Please use the code STRIVE_25 for a 10% discount:{" "}</strong>
                <strong>
                  <a
                    className="faq-link"
                    href="https://www.medentry.edu.au/ucat"
                  >
                    https://www.medentry.edu.au/ucat
                  </a>
                </strong>
                .<br />
                <br />
                We recommend having access to the Essential Package as this
                provides access to the questionbank. You will be able to learn
                strategies with Strive, and then apply these strategies in daily
                preparation using MedEntry.
              </div>
            </div>
          </div>
          <div class="accordion-item" id="faq-ucat-ac-item">
            <h2 class="accordion-header">
              <button
                class="btn primary-button d-flex fw-bold w-100 faq-ucat-q"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseucat3"
                aria-expanded="false"
                aria-controls="panelsStayOpen-collapseucat3"
              >
                How do payments work?
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseucat3"
              class="accordion-collapse collapse"
            >
              <div class="accordion-body">
                  After your free academic consultation, you’ll be asked to add your payment details to your account before scheduling your first paid session.
                  Once your first lesson has taken place, the session fee will be automatically charged to your nominated payment method — never before the lesson.

                  <br />
                  <br />
                  For all future lessons, payments will also be processed automatically after each session.<br />
                  <br />
                  All transactions are securely handled by Stripe, one of the world’s leading payment providers trusted by companies such as Google and Amazon. This ensures that your payment information is fully protected at all times.

              </div>
            </div>
          </div>
          <div class="accordion-item" id="faq-ucat-ac-item">
            <h2 class="accordion-header">
              <button
                class="btn primary-button d-flex fw-bold w-100 faq-ucat-q"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseucat4"
                aria-expanded="false"
                aria-controls="panelsStayOpen-collapseucat4"
              >
                I would prefer private sessions. How can I organise them?
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseucat4"
              class="accordion-collapse collapse"
            >
              <div class="accordion-body">
                We understand that some students work best when they have 1-on-1
                tutor support. <br />
                <br />
                You can get started with private sessions for UCAT preparation
                by finding a tutor - please filter by subject - UCAT and select
                a suitable tutor. <br />
                <br />
                Once you contact the tutor you select, they will then schedule a
                free academic skills consultation and once you complete this,
                you’re all set to start sessions!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Ucat;