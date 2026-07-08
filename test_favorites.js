const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'cloudcomputing2@gmail.com',
    password: 'cloudcomputing'
  });

  if (authError) {
    console.error("Login failed:", authError.message);
    return;
  }
  
  const user = authData.user;
  console.log("Logged in as:", user.id);

  // Try to insert a favorite. We need a place_id. Let's get one first.
  const { data: places, error: pError } = await supabase.from('places').select('id').limit(1);
  if (pError || !places.length) {
    console.error("Could not fetch a place:", pError);
    return;
  }
  
  const placeId = places[0].id;
  console.log("Found place:", placeId);

  // Delete if exists
  await supabase.from('favorites').delete().eq('user_id', user.id).eq('place_id', placeId);

  // Insert
  console.log("Inserting favorite...");
  const { error: insError } = await supabase.from('favorites').insert({ user_id: user.id, place_id: placeId });
  if (insError) {
    console.error("Insert error:", insError);
  } else {
    console.log("Insert success!");
  }

  // Select
  console.log("Fetching favorites...");
  const { data: favs, error: selError } = await supabase
    .from('favorites')
    .select(`
      id,
      place_id,
      places (
        id,
        name,
        lat,
        lng,
        price_min,
        price_max,
        categories(name),
        place_images(image_url, is_primary),
        operating_hours(day_of_week, open_time, close_time, is_closed),
        reviews(rating)
      )
    `)
    .eq('user_id', user.id);

  if (selError) {
    console.error("Select error:", selError);
  } else {
    console.log("Select success! Favs count:", favs.length);
    console.log(JSON.stringify(favs, null, 2));
  }
}

test();
