import "./App.css";
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Card,
  Row,
} from "react-bootstrap";
import { useState, useEffect } from "react";

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    let authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };

    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        setAccessToken(data.access_token);
      });
  }, []);

  async function search() {
    if (!accessToken) {
      console.error("Access token not ready");
      return;
    }

    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    // Get Artist ID
    const artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + encodeURIComponent(searchInput) + "&type=artist",
      artistParams
    )
      .then((result) => result.json())
      .then((data) => {
        if (data.artists.items.length === 0) {
          alert("Artist not found");
          return null;
        }
        return data.artists.items[0].id;
      });

    if (!artistID) return;

    // Fetch all albums with pagination
    let albumsList = [];
    let nextURL =
      "https://api.spotify.com/v1/artists/" +
      artistID +
      "/albums?include_groups=album,single,compilation&market=US&limit=50";

    while (nextURL) {
      const response = await fetch(nextURL, artistParams);
      const data = await response.json();
      albumsList = [...albumsList, ...data.items];
      nextURL = data.next;
    }

    setAlbums(albumsList);
  }

  return (
    <>
      <Container style={{ marginBottom: "50px" }}>
        <InputGroup className="my-3">
          <FormControl
            placeholder="Search For Artist"
            type="input"
            aria-label="Search for an Artist"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
            style={{
              width: "300px",
              height: "35px",
              borderWidth: "0px",
              borderStyle: "solid",
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>

      <Container>
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignContent: "center",
          }}
        >
          {albums.map((album) => (
            <Card
              key={album.id}
              style={{
                backgroundColor: "white",
                margin: "10px",
                borderRadius: "5px",
                marginBottom: "30px",
              }}
            >
              <Card.Img
                src={album.images[0]?.url}
                style={{
                  width: "250px",
                  height: "250px",
                  borderRadius: "5%",
                  objectFit: "cover",
                }}
              />
              <Card.Body style={{ textAlign: "center" }}>
                <Card.Title
                  style={{
                    whiteSpace: "normal",
                    fontWeight: "bold",
                    maxWidth: "250px",
                    fontSize: "25px",
                    marginTop: "10px",
                    color: "black",
                    margin: "0 auto",
                  }}
                >
                  {album.name}
                </Card.Title>
                <Card.Text style={{ color: "black" }}>
                  Release Date: <br /> {album.release_date}
                </Card.Text>
                <Button
                  href={album.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#1DB954",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "15px",
                    borderRadius: "5px",
                    padding: "10px",
                  }}
                >
                  Link
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default App;
