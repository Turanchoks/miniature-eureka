import { setState, state as prevState } from "./state";
import { apiClient, downloadFile, needToDownloadSmallPhoto } from "./apiClient";
import { normalize } from "./utils";

export async function loadUsersByIds(userIds) {
  const usersList = await Promise.all(
    userIds.map(userId =>
      apiClient.api
        .getUser({
          userId
        })
        .then(({ response }) => response)
    )
  );

  setState({
    users: { ...prevState.users, ...normalize(usersList) }
  });

  await Promise.all(
    usersList.map(({ profilePhoto }, index) => {
      if (profilePhoto && needToDownloadSmallPhoto(profilePhoto)) {
        return downloadFile(profilePhoto.small.id, index + 1);
      }
    })
  );

  const usersWithProfilePhoto = await Promise.all(
    usersList.map(user => {
      const { profilePhoto } = user;
      if (!profilePhoto || !profilePhoto.small.id) {
        return Promise.resolve(user);
      }
      return apiClient.api
        .readFile({
          fileId: profilePhoto.small.id
        })
        .then(({ response }) => {
          const blob = response.data;
          let profilePhotoSrc = "";
          if (blob) {
            profilePhotoSrc = URL.createObjectURL(blob);
          }
          return { ...user, profilePhotoSrc };
        });
    })
  );

  setState({
    users: { ...prevState.users, ...normalize(usersWithProfilePhoto) }
  });
}
