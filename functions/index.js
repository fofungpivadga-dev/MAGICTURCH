const functions = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

async function deleteCollectionByQuery(querySnapshot) {
  await Promise.all(querySnapshot.docs.map((doc) => doc.ref.delete()));
}

async function deleteSubcollection(path) {
  const docs = await db.collection(path).listDocuments();
  await Promise.all(docs.map((doc) => doc.delete()));
}

async function wipePainterData(uid) {
  await Promise.all([
    db.doc(`users/${uid}`).delete(),
    db.doc(`listings/${uid}`).delete(),
  ]);

  await Promise.all([
    deleteSubcollection(`portfolios/${uid}/items`),
    deleteSubcollection(`portfolios/${uid}/albums`),
  ]);

  const pins = await db.collection('homepageGallery').where('painterId', '==', uid).get();
  await deleteCollectionByQuery(pins);

  const promoAds = await db.collection('promoAds').where('painterId', '==', uid).get();
  await deleteCollectionByQuery(promoAds);

  const reviews = await db.collection('reviews').where('painterId', '==', uid).get();
  await deleteCollectionByQuery(reviews);

  await db.doc('content/homepage').update({
    featuredPainters: admin.firestore.FieldValue.arrayRemove(uid),
  }).catch(() => {});
}

exports.deleteUser = functions.onCall(async (data, context) => {
  const callerUid = context.auth && context.auth.uid;
  if (!callerUid) {
    throw new functions.HttpsError('unauthenticated', 'You must be signed in to delete an account.');
  }

  const uid = data && typeof data.uid === 'string' ? data.uid.trim() : '';
  if (!uid) {
    throw new functions.HttpsError('invalid-argument', 'A user id is required.');
  }

  const callerDoc = await db.doc(`users/${callerUid}`).get();
  const caller = callerDoc.exists ? callerDoc.data() : null;
  const isAdmin = caller && caller.role === 'admin';

  if (!isAdmin && callerUid !== uid) {
    throw new functions.HttpsError('permission-denied', 'You can only delete your own account.');
  }

  const targetDoc = await db.doc(`users/${uid}`).get();
  if (targetDoc.exists) {
    const target = targetDoc.data();
    if (target.role === 'admin') {
      throw new functions.HttpsError('failed-precondition', 'Admin accounts cannot be deleted.');
    }
  }

  await wipePainterData(uid);

  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      throw new functions.HttpsError('internal', 'Account data deleted but the login record could not be removed. Please retry.');
    }
  }

  return { deleted: true };
});
