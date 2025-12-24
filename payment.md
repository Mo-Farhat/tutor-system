Project Context: Strive Tutoring Payment & Tier Automation

1. Core Architecture: The "Assignment Bucket" Model

To solve the complexity of mapping student packages to tutor tier-based payouts, the system uses an Assignment-centric model.

    The Assignment is the bridge between a Student, a Tutor, and a Subject.

    Hours are tracked at the Assignment level, not the Student level. This ensures a Math package pays the Math tutor and not the Physics tutor.

2. Database Entities & Key Fields
   A. Master Tiers (Admin Configured)
   Field Description Example
   tier_id Primary Key gold_tier
   hourly_rate Gross amount charged to student $60.00
   strive_cut Fixed dollar amount retained by platform $20.00
   payout_rate Calculated: hourly_rate - strive_cut $40.00
   B. The Assignment (The "Bucket")
   Field Description
   assignment_id Primary Key
   student_id Foreign Key to Student
   tutor_id Foreign Key to Tutor (links to Tutor's Tier)
   subject e.g., "Math"
   remaining_hours The "Bucket" of pre-paid hours for this specific pair
   is_physical Default delivery mode (Online vs Physical)
   C. Sessions (The Transaction)
   Field Description
   session_id Primary Key
   assignment_id Links to the specific bucket
   duration e.g., 1.5 hours
   delivery_mode "Online" or "Physical" (determined by Tutor at completion)
   status "Scheduled" or "Completed"
3. Automation Logic (The "Session Completion" Flow)

When a Tutor marks a session as Completed, the system must execute the following logic:
Step 1: Identify the Context

    Fetch the Assignment record.

    Identify the Tutor.tier_id and the Student.stripe_customer_id.

Step 2: Deduct Hours & Handle Overages

    Deduct: Subtract Session.duration from Assignment.remaining_hours.

    Overage Check: If remaining_hours becomes negative:

        Calculate overage_amount = ABS(remaining_hours) * Tier.hourly_rate.

        Trigger Stripe Charge for the overage_amount.

        Reset remaining_hours to 0.

Step 3: Travel Fee Logic

    If Session.delivery_mode == "Physical":

        Trigger Stripe Charge for $15.00 flat fee.

        Note: This fee is never discounted and never deducted from package hours.

Step 4: Tutor Payout Calculation

    Create a Payout Record: (Tier.hourly_rate - Tier.strive_cut) * Session.duration.

    Log the Strive_Cut for admin auditing.

4.  Admin Requirements Mapping

    Audit Trail: Every session completion must log a record containing:

        Base Charge (Value of hours used)

        Travel Fee (If applicable)

        Strive Cut (Based on Tutor Tier)

        Tutor Payout (Net to Tutor)

    Tier Management: Admin can update the strive_cut per tier globally; this updates all future payouts for tutors in that tier.

5.  Stripe Integration Points

    Package Purchase: Charge card -> Add hours to specific Assignment.remaining_hours.

    Session Completion (Travel): Direct charge for $15 if physical.

    Session Completion (Overage): Direct charge for hours exceeding bucket.

    Auto-Renew (Optional): If bucket hits 0, trigger purchase of a new "Template Package."
