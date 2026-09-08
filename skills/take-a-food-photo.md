# Skill: take-a-food-photo

How to shoot a dish so it drops straight into a menu card without editing.
Written after the 2026-09 batch, where six of nine otherwise-good photos had
the dish touching the edge of the frame — pixels that no crop can bring back.

For putting the photo on the site afterwards: `skills/manage-menu-photos.md`.

## The five rules

1. **Dark backdrop.** Black or near-black, matte, no shine. Every existing
   catalogue photo is on black; one photo on a white table clashes with the
   whole menu page. `scripts/fit-food-photo.py` also *finds the dish* by
   looking for what is brighter than the backdrop — a light backdrop breaks
   it, and the photo then needs a hand crop.

2. **Leave space around the dish.** A hand's width of empty backdrop on all
   four sides. This is the rule that got broken in the 2026-09 batch. The
   card frame is wider than it is tall, so a dish shot edge to edge gets its
   rim cut and there is nothing to fall back on.

3. **Shoot straight down.** Phone flat above the dish, looking down. Every
   photo in the catalogue is top-down; a photo taken at an angle reads as a
   different restaurant.

4. **Fill the frame with the dish, not the table.** Get close enough that the
   dish is most of the picture — while still keeping rule 2's margin. Detail
   in the toppings is what sells it.

5. **Light from the side, not from behind the phone.** A window to one side,
   or a lamp to one side. The phone's own flash flattens the food and blows
   out the cheese.

## Practical setup that works

- A black tray, black cloth or black cardboard on the kitchen counter.
- Daylight from a doorway or window, dish about an arm's length from it.
- Phone in one hand directly overhead, tap the food to focus, then shoot.
- Take three or four of each dish — pick the best afterwards on a big screen,
  not on the phone.

## What to shoot

- The dish exactly as a customer receives it, in the same tray or plate.
- A second angle or a closer crop is worth taking: an item can carry more
  than one photo now, and the customer swipes between them.
- Nothing that is not on the menu in the shot — no branded packaging from
  another restaurant, no half-eaten portions, no hands.

## Sizes

Any modern phone photo is more than enough. The fitter outputs 600x400, so
anything from about 1000px wide up is fine. Do not scale a photo up before
sending it — an upscaled photo stays soft. (The logo was rebuilt once for
exactly this reason.)

## Before you hand the photos over

Look at each one full-screen and ask:

- Is the whole dish inside the frame, with backdrop visible all the way
  around? (If not, reshoot — this is the expensive mistake.)
- Is the backdrop dark and even?
- Is the food sharp where it matters — cheese pull, toppings, sesame?
- Does it look like the food that actually leaves the kitchen?

Then follow `skills/manage-menu-photos.md` to put them on the site.
